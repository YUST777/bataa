/**
 * Bataa AI: talks to the `tutor` Supabase Edge Function (supabase/functions/tutor), which holds the
 * Modelflare key and streams gpt-6.1-terra's reply back as OpenAI-style server-sent events.
 * The learner must be signed in: the function checks the session.
 */
import { supabase } from '@/lib/account'

export type ChatMessage = { role: 'user' | 'assistant'; content: string }

const url = `${import.meta.env.VITE_SUPABASE_URL as string}/functions/v1/tutor`

/**
 * Sends the conversation and calls `onText` with the reply so far as it streams in.
 * Rejects with Error('sign_in'), Error('tutor_unavailable') or a network error.
 */
export async function askTutor(
  messages: ChatMessage[],
  context: { lang: 'en' | 'ar'; done: string[]; name: string },
  onText: (text: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  if (!supabase) throw new Error('sign_in')
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('sign_in')
  const res = await fetch(url, {
    method: 'POST',
    signal,
    headers: { Authorization: `Bearer ${token}`, apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, ...context }),
  })
  if (!res.ok || !res.body) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'tutor_unavailable')
  }
  // Server-sent events: lines of `data: {json}`, ending with `data: [DONE]`. A line can arrive split
  // across chunks, so the unfinished tail waits for the next chunk.
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let pending = ''
  let text = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    pending += decoder.decode(value, { stream: true })
    const lines = pending.split('\n')
    pending = lines.pop() ?? ''
    for (const line of lines) {
      const payload = line.startsWith('data:') ? line.slice(5).trim() : ''
      if (!payload || payload === '[DONE]') continue
      try {
        const delta = JSON.parse(payload).choices?.[0]?.delta?.content
        if (delta) {
          text += delta
          onText(text)
        }
      } catch {
        // A keep-alive or a malformed event: skip it.
      }
    }
  }
  return text
}
