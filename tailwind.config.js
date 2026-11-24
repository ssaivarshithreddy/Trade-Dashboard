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
        brand: {
          dark: '#080c15',
          panel: '#0e1626',
          card: '#131e33',
          border: '#1e2d4a',
          hover: '#1b2a47',
          muted: '#8492a6',
          win: '#10b981',
          'win-soft': '#064e3b',
          loss: '#f43f5e',
          'loss-soft': '#4c0519',
          be: '#64748b',
          'be-soft': '#1e293b',
          accent: '#38bdf8',
          gold: '#fbbf24'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
