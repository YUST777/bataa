/**
 * Bataa AI: the chat transport for the AI SDK's useChat. It talks to the `tutor` Supabase Edge Function
 * (supabase/functions/tutor), which holds the Modelflare key and streams gpt-6.1-terra's reply back as
 * plain text. The learner must be signed in: the function checks the session token sent here.
 */
import { TextStreamChatTransport, type UIMessage } from 'ai'
import { supabase } from '@/lib/account'

export type TutorContext = { lang: 'en' | 'ar'; done: string[]; name: string }

export function tutorTransport(context: () => TutorContext) {
  return new TextStreamChatTransport<UIMessage>({
    api: `${import.meta.env.VITE_SUPABASE_URL as string}/functions/v1/tutor`,
    headers: async () => {
      const { data } = (await supabase?.auth.getSession()) ?? { data: { session: null } }
      return { Authorization: `Bearer ${data.session?.access_token ?? ''}`, apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string }
    },
    body: () => context(),
  })
}

/** The words of a message (the tutor only sends text parts). */
export const textOf = (m: UIMessage) => m.parts.map((p) => (p.type === 'text' ? p.text : '')).join('')
