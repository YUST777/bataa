import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

// Only the two grammars the course teaches, on the JS regex engine, so no WASM ships.
const highlighter = createHighlighterCore({
  themes: [import('@shikijs/themes/gruvbox-dark-medium')],
  langs: [import('@shikijs/langs/html'), import('@shikijs/langs/css')],
  engine: createJavaScriptRegexEngine(),
})

// Each snippet is coloured once: lessons and chats show the same few snippets again and again.
const done = new Map<string, string>()

/** Already-coloured markup for a snippet, if it has been coloured before (lets a card paint coloured at once). */
export const cached = (code: string) => done.get(code)

/** Coloured markup for a snippet of course code. A snippet with a tag is HTML, anything else is CSS. */
export const highlight = (code: string) =>
  done.has(code)
    ? Promise.resolve(done.get(code)!)
    : highlighter.then((h) => {
        const html = h.codeToHtml(code, { lang: code.includes('<') ? 'html' : 'css', theme: 'gruvbox-dark-medium', structure: 'inline' })
        done.set(code, html)
        return html
      })

/** The first snippet in each language compiles its grammar (about a third of a second on a slow phone), so do it while idle. */
export const warm = () => Promise.all([highlight('<a href="#">Hi</a>'), highlight('a { color: red; }')]).then(() => {})
