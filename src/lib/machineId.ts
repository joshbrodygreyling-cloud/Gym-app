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

const API_KEY_STORAGE = 'fitforge.anthropicKey'

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
