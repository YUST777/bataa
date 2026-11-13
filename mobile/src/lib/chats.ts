/**
 * Bataa AI chats: kept on the phone (localStorage) so they open instantly and offline, and copied to the
 * learner's account (Supabase `chats`, see supabase/migrations/20261113150000_chats.sql) so they follow
 * them to any phone. Lesson "Ask" chats are saved here too, so they show up in the chat list.
 */
import type { UIMessage } from 'ai'
import { supabase } from '@/lib/account'
import { textOf } from '@/lib/tutor'

/** A saved chat, newest first in lists. `title` is the learner's first question. */
export type SavedChat = { id: string; title: string; at: number; messages: UIMessage[] }

const KEY = 'bataa.chats'
const MAX_CHATS = 30
const MAX_MESSAGES = 40

const valid = (v: unknown): UIMessage[] =>
  Array.isArray(v) ? v.filter((m) => m && (m.role === 'user' || m.role === 'assistant') && Array.isArray(m.parts)).slice(-MAX_MESSAGES) : []
const clean = (list: unknown[]): SavedChat[] =>
  list
    .filter((c): c is SavedChat => !!c && typeof (c as SavedChat).id === 'string')
    .map((c) => ({ id: c.id, title: String(c.title ?? '').slice(0, 120), at: Number(c.at) || 0, messages: valid(c.messages) }))
    .filter((c) => c.messages.length)
    .sort((a, b) => b.at - a.at)
    .slice(0, MAX_CHATS)

export const titleOf = (messages: UIMessage[]) => {
  const first = messages.find((m) => m.role === 'user')
  return first ? textOf(first).replace(/\s+/g, ' ').trim().slice(0, 60) : ''
}

/** The chats on this phone. */
export function loadChats(): SavedChat[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    if (Array.isArray(v)) return clean(v)
    // The single chat from before there were many becomes the first one.
    const old = valid(JSON.parse(localStorage.getItem('bataa.chat.v2') ?? '[]'))
    return old.length ? [{ id: crypto.randomUUID(), title: titleOf(old), at: Date.now(), messages: old }] : []
  } catch {
    return []
  }
}

function store(chats: SavedChat[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(chats.slice(0, MAX_CHATS)))
  } catch {
    // Storage full or blocked: chats still work, they just are not kept on this phone.
  }
}

/** The signed-in learner's id, or null (signed out or no Supabase). */
async function me() {
  const { data } = (await supabase?.auth.getSession()) ?? { data: { session: null } }
  return data.session?.user.id ?? null
}

/** Saves one chat (new or changed) here and to the account. Returns the updated list. */
export function saveChat(chat: SavedChat): SavedChat[] {
  const next = clean([chat, ...loadChats().filter((c) => c.id !== chat.id)])
  store(next)
  void me().then((uid) => {
    if (!uid || !supabase) return
    supabase
      .from('chats')
      .upsert({ user_id: uid, id: chat.id, title: chat.title, at: chat.at, messages: chat.messages.slice(-MAX_MESSAGES) })
      .then(({ error }) => error && console.warn('Chat not saved to the account:', error.message))
  })
  return next
}

/** Deletes a chat here and from the account. Returns the updated list. */
export function deleteChat(id: string): SavedChat[] {
  const next = loadChats().filter((c) => c.id !== id)
  store(next)
  void me().then((uid) => {
    if (!uid || !supabase) return
    supabase
      .from('chats')
      .delete()
      .eq('user_id', uid)
      .eq('id', id)
      .then(({ error }) => error && console.warn('Chat not deleted from the account:', error.message))
  })
  return next
}

/**
 * Brings this phone and the account into step: every chat from either side, the newer copy of each, and
 * anything only on this phone (made while signed out or offline) is uploaded. Returns the merged list, or
 * null when signed out or the account could not be reached.
 */
export async function syncChats(): Promise<SavedChat[] | null> {
  const uid = await me()
  if (!uid || !supabase) return null
  const { data, error } = await supabase.from('chats').select('id, title, at, messages').order('at', { ascending: false }).limit(MAX_CHATS)
  if (error) {
    console.warn('Chats did not sync:', error.message)
    return null
  }
  const remote = clean(data ?? [])
  const local = loadChats()
  const byId = new Map(remote.map((c) => [c.id, c]))
  const upload = local.filter((c) => (byId.get(c.id)?.at ?? -1) < c.at)
  for (const c of local) if ((byId.get(c.id)?.at ?? -1) < c.at) byId.set(c.id, c)
  const merged = clean([...byId.values()])
  store(merged)
  if (upload.length)
    supabase
      .from('chats')
      .upsert(upload.map((c) => ({ user_id: uid, id: c.id, title: c.title, at: c.at, messages: c.messages })))
      .then(({ error }) => error && console.warn('Chats not uploaded:', error.message))
  return merged
}
