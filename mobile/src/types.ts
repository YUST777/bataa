export type Lang = 'en' | 'ar'
/** A string in both app languages. Code is never translated, so it stays a plain string. */
export type L = { en: string; ar: string }
export type CodeLang = 'html' | 'css'

interface TaskBase {
  id: string
  prompt: L
  /** Shown after a correct answer: why it works. */
  explain: L
  /** Shown after a mistake: the smallest useful next step. */
  hint: L
  /** A read-only snippet shown under the prompt (used by debug questions). */
  show?: string
  /** Language of the learner's code. Set it to get a live preview. */
  lang?: CodeLang
  /** The other half of the page: CSS for an HTML task, HTML for a CSS task. */
  fixture?: string
}

export interface ChoiceTask extends TaskBase {
  type: 'choice'
  /** `text` as a plain string renders as code; `value` is the code previewed when chosen. */
  options: { id: string; text: L | string; value?: string }[]
  answer: string
}

export interface FillTask extends TaskBase {
  type: 'fill'
  /** Code with one `___` blank. */
  code: string
  bank: string[]
  answer: string
}

export interface OrderTask extends TaskBase {
  type: 'order'
  /** Tokens offered, already mixed. May hold distractors. */
  bank: string[]
  answer: string[]
  /** Code around the arranged tokens, with one `___` where they go. */
  wrap?: string
}

export interface MatchTask extends TaskBase {
  type: 'match'
  pairs: { code: string; means: L }[]
}

export type Rule = (
  | { tag: string; text?: string; attr?: string }
  | { selector: string; prop: string }
) & { fail: L }

export interface CodeTask extends TaskBase {
  type: 'code'
  lang: CodeLang
  starter: string
  solution: string
  rules: Rule[]
}

export type Task = ChoiceTask | FillTask | OrderTask | MatchTask | CodeTask

/** choice/fill/code: string. order: picked bank indexes. match: code -> index of its meaning. */
export type Answer = string | number[] | Record<string, number>

export interface Lesson {
  id: string
  title: L
  /** Capability statement, completes "You can now ...". */
  can: L
  minutes: number
  /** What the learner built, shown on the completion screen. */
  artifact: { html: string; css: string }
  tasks: Task[]
}

export interface Unit {
  id: string
  title: L
  goal: L
  lessons: Lesson[]
}
