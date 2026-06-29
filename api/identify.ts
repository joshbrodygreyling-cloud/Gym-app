import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

/**
 * Machine identifier endpoint.
 *
 * Receives a base64 image from the browser and asks Claude to identify the gym
 * machine and explain how to use it. The Anthropic API key is read from the
 * ANTHROPIC_API_KEY environment variable on the server — it never reaches the
 * client, so this is the safe way to ship a shared key.
 *
 * Responds:
 *   200 { rawName, description }   — success
 *   501 { error: 'not_configured' } — no ANTHROPIC_API_KEY set on the server
 *   4xx/5xx { error }              — bad input or upstream failure
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'method_not_allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    // Feature isn't configured on this deployment — the client falls back to
    // text search (or a user-supplied key) when it sees this.
    return res.status(501).json({ error: 'not_configured' })
  }

  const { imageBase64, mediaType } = (req.body ?? {}) as {
    imageBase64?: string
    mediaType?: string
  }

  if (!imageBase64) {
    return res.status(400).json({ error: 'missing_image' })
  }

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  const media = allowed.includes(mediaType ?? '') ? (mediaType as string) : 'image/jpeg'

  try {
    const client = new Anthropic({ apiKey })

    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 700,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: media as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text:
                'This is a photo of a piece of gym equipment. Identify the machine and explain in ' +
                'simple, friendly steps how to use it safely.\n\n' +
                'Reply in this exact format:\n' +
                'NAME: <the common name of the machine>\n' +
                'GUIDE: <2-4 short sentences on how to use it and what it works>',
            },
          ],
        },
      ],
    })

    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')

    const nameMatch = text.match(/NAME:\s*(.+)/i)
    const guideMatch = text.match(/GUIDE:\s*([\s\S]+)/i)
    const rawName = nameMatch?.[1]?.trim() ?? text.split('\n')[0]?.trim() ?? 'Gym machine'
    const description = guideMatch?.[1]?.trim() ?? text

    return res.status(200).json({ rawName, description })
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      return res.status(502).json({ error: `ai_error_${err.status ?? 'unknown'}` })
    }
    return res.status(500).json({ error: 'server_error' })
  }
}
