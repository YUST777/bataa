/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fffbf5',
          100: '#fff6e9',
          200: '#fef1dc',
          300: '#fde8c7',
          400: '#fbd49b',
        },
        moca: {
          50: '#fdf8f4',
          100: '#fbf0e8',
          200: '#f6decb',
          300: '#edc4a4',
          400: '#df9e6e',
          500: '#d07d43',
          600: '#b8612f',
          700: '#894622',
          800: '#5c2d16',
          900: '#2d180b',
        },
        bataa: {
          orange: '#ff8500',
          orangeDark: '#d45900',
          orangeHover: '#ff981a',
          brown: '#2d180b',
          brownSoft: '#895f3c',
          line: '#edcfad',
          green: '#58cc02',
          greenDark: '#58a700',
          red: '#ff4b4b',
          redDark: '#ea2b2b',
          blue: '#1cb0f6',
          blueDark: '#1899d6',
          yellow: '#ffd600',
          yellowDark: '#e5c000',
          codeBg: '#282a36',
          codeSurface: '#1e1f29',
        }
      },
      fontFamily: {
        sans: ['"Avenir Next"', 'Nunito', 'system-ui', 'sans-serif'],
        arabic: ['"IBM Plex Sans Arabic"', 'Tajawal', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'tactile-sm': '0 2px 0 0 var(--btn-lip, #d45900)',
        'tactile': '0 4px 0 0 var(--btn-lip, #d45900)',
        'tactile-lg': '0 6px 0 0 var(--btn-lip, #d45900)',
        'tactile-card': '0 4px 0 0 #ebe0d2',
        'glow-yellow': '0 0 16px rgba(255, 214, 0, 0.45)',
        'glow-orange': '0 0 20px rgba(255, 133, 0, 0.35)',
      },
      borderRadius: {
        '2xl': '18px',
        '3xl': '24px',
        '4xl': '32px',
      }
    },
  },
  plugins: [],
}
