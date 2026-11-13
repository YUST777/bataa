// Bataa AI: the tutor behind the Practice chat. The app sends the conversation; this function adds the
// tutor's instructions and streams the reply from Modelflare (gpt-6.1-terra, OpenAI-style chat API).
// The Modelflare key lives only here, as the MODELFLARE_API_KEY secret, never in the app bundle.
// Only signed-in learners may call it, so the public anon key alone cannot spend the credits.
import { createClient } from 'npm:@supabase/supabase-js@2.116.0'

const MODEL = 'gpt-6.1-terra'
const API = 'https://modelflare.dev/v1/chat/completions'
const MAX_TURNS = 20
const MAX_CHARS = 2000

const LESSONS: Record<string, string> = {
  button: 'buttons: <button>, opening and closing tags',
  text: 'headings and paragraphs: <h1>, <h2>, <p>',
  links: 'links and images: <a href>, <img src alt>, attributes',
  color: 'CSS rules, background and color',
  shape: 'padding, border-radius, border',
  hover: 'the :hover state',
}

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const fail = (status: number, error: string) => new Response(JSON.stringify({ error }), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

function instructions(lang: 'en' | 'ar', done: string[], name: string) {
  const learned = done.filter((id) => LESSONS[id]).map((id) => `- ${LESSONS[id]}`)
  return [
    'You are Bataa, a friendly duck who tutors beginners in a mobile app that teaches web development (HTML and CSS, a little JavaScript).',
    lang === 'ar' ? 'Always reply in Arabic (Modern Standard, simple words). Keep code, tag names and properties in English.' : 'Always reply in English.',
    'Teach one idea at a time in plain words. Keep replies short: at most about 120 words.',
    'Show tiny examples in fenced code blocks marked html or css. Use `backticks` for tag and property names in sentences.',
    'When the learner asks to be quizzed or to practise, ask ONE question at a time, wait for their answer, then say whether it is right and why, and offer the next one.',
    'If they are wrong, be kind, give a hint before the answer.',
    'Only help with web development and learning to code. For anything else, say so in one friendly line and steer back.',
    'No headings, no tables. Short paragraphs and short lists are fine.',
    name ? `The learner's name is ${name}.` : '',
    learned.length
      ? `They have finished lessons on:\n${learned.join('\n')}\nBuild on these; quiz them on these first.`
      : 'They have not finished a lesson yet: start from the very basics.',
  ]
    .filter(Boolean)
    .join('\n')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return fail(405, 'POST only')

  const auth = req.headers.get('Authorization') ?? ''
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } })
  const { data } = await supabase.auth.getUser()
  if (!data.user) return fail(401, 'sign_in')

  let body: { messages?: unknown; lang?: unknown; done?: unknown; name?: unknown }
  try {
    body = await req.json()
  } catch {
    return fail(400, 'bad_json')
  }
  // Only the learner's and the tutor's turns, trimmed: the instructions are always ours.
  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m): m is { role: 'user' | 'assistant'; content: string } => !!m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }))
  if (!messages.length || messages[messages.length - 1].role !== 'user') return fail(400, 'no_question')
  const lang = body.lang === 'ar' ? 'ar' : 'en'
  const done = Array.isArray(body.done) ? body.done.filter((d): d is string => typeof d === 'string').slice(0, 50) : []
  const name = typeof body.name === 'string' ? body.name.slice(0, 30) : ''

  // shortcut: no per-learner rate limit yet; add one (a counter table) if usage gets heavy.
  const upstream = await fetch(API, {
    method: 'POST',
    headers: { Authorization: `Bearer ${Deno.env.get('MODELFLARE_API_KEY')}`, 'Content-Type': 'application/json', 'X-Modelflare-Skill': 'bataa-tutor/1.0' },
    body: JSON.stringify({ model: MODEL, stream: true, max_tokens: 700, messages: [{ role: 'system', content: instructions(lang, done, name) }, ...messages] }),
  })
  if (!upstream.ok || !upstream.body) {
    console.error('Modelflare error', upstream.status, await upstream.text().catch(() => ''))
    return fail(502, 'tutor_unavailable')
  }
  // The OpenAI-style event stream goes straight through to the app.
  return new Response(upstream.body, { headers: { ...cors, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } })
})
