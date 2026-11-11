/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Semantic tokens: reconciled from .agents/skills/mimo-duolingo-design-system/references/ui_tokens.json
      colors: {
        bg: '#FFF6E9',
        surface: '#FFFFFF',
        warm: '#FFF9F1',
        ink: '#2D180B',
        ink2: '#6F5A48',
        line: '#EBE1D3',
        lip: '#D8CABB',
        // #F26B00 not #FF7A00: white bold button text needs 3:1 contrast
        brand: '#F26B00',
        brandDeep: '#B94B00',
        brandSoft: '#FFE9D2',
        ok: '#2E8B57',
        okDeep: '#1F6B41',
        okSoft: '#EAF7EF',
        bad: '#C43D3D',
        badDeep: '#972B2B',
        badSoft: '#FFF0EE',
        sun: '#FFD600',
        code: '#241A12',
        lock: '#8A8078',
      },
      fontFamily: {
        sans: ['Nunito', '"Avenir Next"', 'system-ui', 'sans-serif'],
        arabic: ['"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
