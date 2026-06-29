import { EXERCISES } from '../data/exercises'
import type { Exercise } from '../types'

/** Fuzzy-ish text search across machine/exercise names and aliases. */
export function searchExercises(query: string): Exercise[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const terms = q.split(/\s+/)

  return EXERCISES.map((e) => {
    const haystack = [e.name, ...e.aliases, ...e.primaryMuscles].join(' ').toLowerCase()
    let score = 0
    for (const term of terms) {
      if (haystack.includes(term)) score += 2
      if (e.name.toLowerCase().startsWith(term)) score += 3
      if (e.aliases.some((a) => a.toLowerCase().includes(term))) score += 1
    }
    return { e, score }
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.e)
}

// ---------------------------------------------------------------------------
// Optional AI vision (Claude). Key is stored locally by the user and never
// leaves their browser except in the direct API call they opt into.
// ---------------------------------------------------------------------------

const API_KEY_STORAGE = 'liftiq.anthropicKey'

export function getApiKey(): string {
  return localStorage.getItem(API_KEY_STORAGE) ?? ''
}

export function setApiKey(key: string): void {
  if (key.trim()) localStorage.setItem(API_KEY_STORAGE, key.trim())
  else localStorage.removeItem(API_KEY_STORAGE)
}

export interface VisionResult {
  /** best matching exercise in our library, if any */
  match?: Exercise
  /** the model's free-text identification & guidance */
  description: string
  rawName: string
}

function fileToBase64(file: File): Promise<{ data: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const [meta, data] = result.split(',')
      const mediaType = meta.match(/data:(.*?);/)?.[1] ?? 'image/jpeg'
      resolve({ data, mediaType })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Downscale a photo to keep the upload small (phone photos are several MB).
 * Returns JPEG base64. Falls back to the raw file if canvas isn't available.
 */
async function fileToCompressedBase64(
  file: File,
  maxDim = 1280,
): Promise<{ data: string; mediaType: string }> {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height))
    const w = Math.max(1, Math.round(bitmap.width * scale))
    const h = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('no-2d-context')
    ctx.drawImage(bitmap, 0, 0, w, h)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.82)
    const data = dataUrl.split(',')[1]
    return { data, mediaType: 'image/jpeg' }
  } catch {
    return fileToBase64(file)
  }
}

// ---------------------------------------------------------------------------
// Server-proxied identification (uses ANTHROPIC_API_KEY on the server).
// ---------------------------------------------------------------------------

/** Thrown when the server endpoint has no API key configured. */
export const SERVER_NOT_CONFIGURED = 'SERVER_NOT_CONFIGURED'

async function identifyViaServer(file: File): Promise<VisionResult> {
  const { data, mediaType } = await fileToCompressedBase64(file)

  let res: Response
  try {
    res = await fetch('/api/identify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ imageBase64: data, mediaType }),
    })
  } catch {
    // No server reachable (e.g. local `vite` dev with no functions running).
    throw new Error(SERVER_NOT_CONFIGURED)
  }

  // 404 (no function deployed) or 501 (no key configured) -> let caller fall back.
  if (res.status === 404 || res.status === 501) throw new Error(SERVER_NOT_CONFIGURED)
  if (!res.ok) throw new Error(`Identification failed (${res.status}). Please try again.`)

  // In plain `vite` dev/preview there's no function, so the SPA fallback returns
  // HTML — treat anything that isn't JSON as "no server" and fall back.
  if (!res.headers.get('content-type')?.includes('application/json')) {
    throw new Error(SERVER_NOT_CONFIGURED)
  }

  const json = (await res.json()) as { rawName?: string; description?: string }
  const rawName = json.rawName ?? 'Gym machine'
  const description = json.description ?? ''
  const match = searchExercises(rawName)[0]
  return { match, description, rawName }
}

/**
 * Identify a machine from a photo. Tries the server endpoint first (shared key
 * via env var); if that isn't configured, falls back to a user-supplied key
 * stored on the device, and otherwise reports NO_API_KEY so the UI can prompt.
 */
export async function identifyMachine(file: File): Promise<VisionResult> {
  try {
    return await identifyViaServer(file)
  } catch (err) {
    const msg = err instanceof Error ? err.message : ''
    if (msg === SERVER_NOT_CONFIGURED) {
      if (getApiKey()) return identifyMachineWithAI(file)
      throw new Error('NO_API_KEY')
    }
    throw err
  }
}

/**
 * Ask Claude to identify the machine in a photo. Returns a description plus the
 * closest match in our local library so we can show full how-to instructions.
 */
export async function identifyMachineWithAI(file: File): Promise<VisionResult> {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('NO_API_KEY')

  const { data, mediaType } = await fileToBase64(file)
  const knownNames = EXERCISES.filter((e) => e.category === 'machine' || e.category === 'cardio' || e.category === 'cable')
    .map((e) => e.name)
    .join(', ')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-8',
      max_tokens: 700,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data },
            },
            {
              type: 'text',
              text:
                `This is a photo of a piece of gym equipment. Identify the machine and explain in simple, friendly steps how to use it safely.\n\n` +
                `Reply in this exact format:\n` +
                `NAME: <the common name of the machine>\n` +
                `GUIDE: <2-4 short sentences on how to use it and what it works>\n\n` +
                `If it closely matches one of these known machines, use that exact name: ${knownNames}.`,
            },
          ],
        },
      ],
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`AI request failed (${res.status}): ${text.slice(0, 200)}`)
  }

  const json = await res.json()
  const content: string = json?.content?.[0]?.text ?? ''
  const nameMatch = content.match(/NAME:\s*(.+)/i)
  const guideMatch = content.match(/GUIDE:\s*([\s\S]+)/i)
  const rawName = nameMatch?.[1]?.trim() ?? content.split('\n')[0]
  const description = guideMatch?.[1]?.trim() ?? content

  // try to map to a library entry for full instructions
  const matches = searchExercises(rawName)
  return { match: matches[0], description, rawName }
}
