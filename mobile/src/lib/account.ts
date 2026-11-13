/**
 * Accounts: Google sign-in through Supabase Auth, and progress kept in the cloud so it follows the learner
 * to any device. Signing in is optional; the app works fully offline on local storage without it.
 *
 * Config (mobile/.env.local): VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, the project's public URL and
 * anon (publishable) key, and VITE_GOOGLE_WEB_CLIENT_ID, the Google web client Supabase checks tokens
 * against. Without the first two `supabase` is null and the sign-in buttons say it is not set up.
 * The table it syncs to is created by supabase/migrations/20261112000000_progress.sql.
 */
import { useEffect, useRef, useState } from 'react'
import { createClient, type Session } from '@supabase/supabase-js'
import { toast } from 'sonner'
import { parse, type Progress } from '@/state/progress'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase = url && key ? createClient(url, key, { auth: { flowType: 'pkce', persistSession: true, detectSessionInUrl: true, storageKey: 'bataa.auth' } }) : null

/**
 * Inside the Android app the page is served from https://app.local (android/manual MainActivity).
 * There sign-in is native: Android's own Google account sheet (Credential Manager, through the
 * window.BataaNative bridge) hands back a Google ID token, and Supabase signs in with it; no browser.
 * If that is not possible on the phone (no Google Play services, or a setup error), it falls back to
 * Google's page in the browser, which comes back through the app link com.bataa.app://auth-callback.
 * On the web it is a plain redirect.
 */
export const inApp = window.location.host === 'app.local'
const APP_CALLBACK = 'com.bataa.app://auth-callback'
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID as string | undefined

type Bridge = { signInWithGoogle: (clientId: string, nonce: string) => void; setTheme?: (theme: 'dark' | 'light') => void }
declare global {
  interface Window {
    BataaNative?: Bridge
    __bataaGoogle?: (token: string | null, error: string | null) => void
    /** Android back (MainActivity): true when the page handled it. */
    __bataaBack?: () => boolean
  }
}

/**
 * Signs in with Google. Resolves to 'signed-in' (native, done), null (left for Google's page), 'cancelled',
 * or an error message.
 */
export async function signInWithGoogle(): Promise<string | null> {
  if (!supabase) return 'unavailable'
  const bridge = window.BataaNative
  if (inApp && bridge && GOOGLE_CLIENT_ID) {
    const result = await nativeGoogle(bridge, GOOGLE_CLIENT_ID)
    if (result === null) return 'signed-in'
    if (result === 'cancelled') return result
    // Say why, so a setup problem is visible on the phone, then try Google's page instead.
    toast.error(`Google: ${result}`)
    console.warn('Native Google sign-in failed, using the browser instead:', result)
  }
  const redirectTo = inApp ? APP_CALLBACK : window.location.origin + window.location.pathname
  const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
  return error ? error.message : null
}

/**
 * The native sheet. Google puts the SHA-256 of a one-time nonce in the token; Supabase is given the nonce
 * itself and checks they match, so a captured token cannot be replayed.
 */
async function nativeGoogle(bridge: Bridge, clientId: string): Promise<string | null> {
  const nonce = [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, '0')).join('')
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(nonce))
  const hashed = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
  const answer = await new Promise<{ token: string | null; error: string | null }>((resolve) => {
    window.__bataaGoogle = (token, error) => resolve({ token, error })
    bridge.signInWithGoogle(clientId, hashed)
  })
  if (!answer.token) return answer.error ?? 'failed'
  const { error } = await supabase!.auth.signInWithIdToken({ provider: 'google', token: answer.token, nonce })
  return error ? error.message : null
}

export const signOut = () => supabase?.auth.signOut()

/** The current session, kept up to date (null when signed out or when accounts are not set up). */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])
  return session
}

/**
 * Profile photo in the cloud: avatars/<user id>/avatar.jpg in Supabase Storage (public bucket, each user
 * writes only their own folder; supabase/migrations/20261113000000_avatars.sql), linked from the account as
 * bataa_photo (not avatar_url, which Google overwrites at every sign-in); a new device picks it up there. An empty photo removes it. Signed out: nothing to do.
 * Resolves to an error message, or null.
 */
export async function saveAvatar(photo: string): Promise<string | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  const uid = data.session?.user.id
  if (!uid) return null
  const path = `${uid}/avatar.jpg`
  if (!photo) {
    await supabase.storage.from('avatars').remove([path])
    const { error } = await supabase.auth.updateUser({ data: { bataa_photo: null } })
    return error?.message ?? null
  }
  const blob = await (await fetch(photo)).blob()
  const up = await supabase.storage.from('avatars').upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
  if (up.error) return up.error.message
  // The version stops phones from showing an old cached copy after a change.
  const url = `${supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl}?v=${Date.now()}`
  const { error } = await supabase.auth.updateUser({ data: { bataa_photo: url } })
  return error?.message ?? null
}

/** How far along a save is, to decide which copy wins when a device and the cloud disagree. */
const score = (p: Progress) => p.xp * 1000 + p.done.length * 10 + (p.onboarded ? 1 : 0)

/**
 * Keeps progress in the cloud while signed in. On sign-in it loads the cloud copy if that one is further
 * along (a returning learner on a new device), otherwise it uploads this device's copy. After that every
 * change is saved, a moment after the last one. A first sign-in also fills an empty name and photo from Google.
 */
export function useCloudSync(session: Session | null, p: Progress, load: (next: Progress) => void, patch: (patch: Partial<Progress>) => void) {
  const [ready, setReady] = useState<string | null>(null) // the user id whose copy has been reconciled
  const live = useRef(p)
  live.current = p
  const uid = session?.user.id ?? null

  useEffect(() => {
    if (!supabase || !uid) return setReady(null)
    let cancelled = false
    ;(async () => {
      const { data, error } = await supabase.from('progress').select('data').eq('user_id', uid).maybeSingle()
      if (cancelled) return
      if (error) {
        console.warn('Progress sync is off:', error.message)
        return
      }
      const remote = data ? parse(JSON.stringify(data.data)) : null
      if (remote && score(remote) > score(live.current)) load({ ...remote, lang: live.current.lang, photo: live.current.photo })
      // Who they are, from Google, unless they already set it here.
      const meta = session!.user.user_metadata ?? {}
      const name = String(meta.full_name ?? meta.name ?? '')
        .trim()
        .slice(0, 30)
      const base = remote && score(remote) > score(live.current) ? remote : live.current
      if (!base.name && name) patch({ name })
      if (!live.current.photo && (meta.bataa_photo || meta.avatar_url || meta.picture)) {
        const photo = await toPhoto(String(meta.bataa_photo ?? meta.avatar_url ?? meta.picture))
        if (photo && !cancelled) patch({ photo })
      }
      setReady(uid)
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid])

  // Save a moment after the last change.
  useEffect(() => {
    if (!supabase || !uid || ready !== uid) return
    const id = window.setTimeout(() => {
      supabase!
        .from('progress')
        .upsert({ user_id: uid, data: { ...p, photo: '' }, updated_at: new Date().toISOString() })
        .then(({ error }) => error && console.warn('Progress not saved:', error.message))
    }, 1500)
    return () => clearTimeout(id)
  }, [p, uid, ready])
}

/** Downloads a profile picture into the small JPEG data URL the profile stores (256px, like Profile's cropper). */
async function toPhoto(src: string): Promise<string | null> {
  try {
    const blob = await (await fetch(src.replace(/=s\d+-c$/, '=s256-c'))).blob()
    const img = await createImageBitmap(blob)
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 256
    const s = Math.min(img.width, img.height)
    canvas.getContext('2d')!.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 256, 256)
    return canvas.toDataURL('image/jpeg', 0.85)
  } catch {
    return null // Blocked or offline: the learner keeps the initial avatar.
  }
}
