/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}', './node_modules/streamdown/dist/*.js'],
  theme: {
    extend: {
      // Bataa's warm palette on a white ground: hairlines and soft shadows instead of heavy borders.
      colors: {
        ink: '#1F1611',
        ink2: '#7A6A5D',
        ink3: '#B5A99D',
        line: '#EFE6DA',
        lip: '#E3D6C6',
        warm: '#FFF8EF',
        // The page itself: warm cream behind every screen (frosted glass sits on it).
        page: '#FFF4E8',
        // accent: fill for the primary action, always with ink text. brand: orange as text or icon on white.
        accent: '#FF8A1F',
        brand: '#C25300',
        brandDeep: '#9A4200',
        brandSoft: '#FFF1E3',
        ok: '#23A160',
        okDeep: '#157A45',
        okSoft: '#EAF8F0',
        okLine: '#A9E0C1',
        bad: '#D94141',
        badFill: '#C23636',
        badDeep: '#A52C2C',
        badSoft: '#FDEEEE',
        sun: '#FFC533',
        sky: '#2F9BF0',
        code: '#1C1410',
        lock: '#B5A99D',
      },
      fontFamily: {
        sans: ['Figtree', 'system-ui', 'sans-serif'],
        arabic: ['"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(60,35,10,.04), 0 8px 24px -12px rgba(60,35,10,.14)',
        float: '0 2px 6px rgba(60,35,10,.06), 0 24px 48px -16px rgba(60,35,10,.28)',
      },
    },
  },
  plugins: [],
}
