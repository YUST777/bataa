import type { Answer, L, Rule, Task } from '@/types'

/** The empty answer a task starts with. */
export function blank(task: Task): Answer {
  if (task.type === 'order') return []
  if (task.type === 'match') return {}
  return task.type === 'code' ? task.starter : ''
}

/** True when there is enough input to make checking worthwhile. */
export function ready(task: Task, answer: Answer): boolean {
  if (task.type === 'order') return (answer as number[]).length > 0
  if (task.type === 'match') return Object.keys(answer as object).length === task.pairs.length
  return (answer as string).trim().length > 0
}

/** The correct answer, used by "Show solution". */
export function solution(task: Task): Answer {
  switch (task.type) {
    case 'choice':
    case 'fill':
      return task.answer
    case 'code':
      return task.solution
    case 'match':
      return Object.fromEntries(task.pairs.map((p, i) => [p.code, i]))
    case 'order': {
      // Each bank token is used at most once, so duplicates resolve to distinct indexes.
      const used = new Set<number>()
      return task.answer.map((token) => {
        const i = task.bank.findIndex((b, j) => b === token && !used.has(j))
        used.add(i)
        return i
      })
    }
  }
}

/** The code the learner has built so far, or null when the task has none to preview. */
export function compose(task: Task, answer: Answer): string | null {
  switch (task.type) {
    case 'choice':
      return task.options.find((o) => o.id === answer)?.value ?? null
    case 'fill':
      return task.code.replace('___', answer as string)
    case 'order': {
      const joined = (answer as number[]).map((i) => task.bank[i]).join(task.lang === 'css' ? ' ' : '')
      return task.wrap ? task.wrap.replace('___', joined) : joined
    }
    case 'code':
      return answer as string
    case 'match':
      return null
  }
}

/** The page to render in the live preview. */
export function previewDoc(task: Task, answer: Answer): { html: string; css: string } | null {
  if (!task.lang) return null
  const code = compose(task, answer)
  if (code === null) return null
  return task.lang === 'html'
    ? { html: code, css: task.fixture ?? '' }
    : { html: task.fixture ?? '', css: code }
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// shortcut: regex checks suit the short single-element snippets in these lessons;
// move to DOMParser / CSSStyleSheet when a lesson needs nested markup or at-rules.
function passes(code: string, rule: Rule): boolean {
  if ('selector' in rule) {
    const block = new RegExp(`(?:^|})\\s*${esc(rule.selector)}\\s*\\{([^}]*)\\}`, 'i').exec(code)?.[1]
    return !!block && new RegExp(`(?:^|;)\\s*${esc(rule.prop)}[\\w-]*\\s*:\\s*[^;\\s]`, 'i').test(block)
  }
  const m = new RegExp(`<${rule.tag}\\b([^>]*)>([\\s\\S]*?)</${rule.tag}\\s*>`, 'i').exec(code)
  if (!m) return false
  if (rule.attr && !new RegExp(`\\b${esc(rule.attr)}\\s*=\\s*["'][^"']+["']`, 'i').test(m[1])) return false
  const inner = m[2].replace(/<[^>]*>/g, '').trim().toLowerCase()
  return rule.text ? inner.includes(rule.text.toLowerCase()) : inner.length > 0
}

/** Checks an answer. `why` carries the specific correction when there is one. */
export function check(task: Task, answer: Answer): { ok: boolean; why?: L } {
  switch (task.type) {
    case 'choice':
    case 'fill':
      return { ok: answer === task.answer }
    case 'order': {
      const picked = (answer as number[]).map((i) => task.bank[i])
      return { ok: picked.length === task.answer.length && picked.every((t, i) => t === task.answer[i]) }
    }
    case 'match':
      return { ok: task.pairs.every((p, i) => (answer as Record<string, number>)[p.code] === i) }
    case 'code': {
      const failed = task.rules.find((rule) => !passes(answer as string, rule))
      return failed ? { ok: false, why: failed.fail } : { ok: true }
    }
  }
}
