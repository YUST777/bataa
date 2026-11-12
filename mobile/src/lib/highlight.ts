import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

// Only the two grammars the course teaches, on the JS regex engine, so no WASM ships.
const highlighter = createHighlighterCore({
  themes: [import('@shikijs/themes/gruvbox-dark-medium')],
  langs: [import('@shikijs/langs/html'), import('@shikijs/langs/css')],
  engine: createJavaScriptRegexEngine(),
})

/** Coloured markup for a snippet of course code. A snippet with a tag is HTML, anything else is CSS. */
export const highlight = (code: string) =>
  highlighter.then((h) => h.codeToHtml(code, { lang: code.includes('<') ? 'html' : 'css', theme: 'gruvbox-dark-medium', structure: 'inline' }))
