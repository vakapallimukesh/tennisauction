/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tennis: {
          dark: '#060b17',
          card: 'rgba(12, 21, 51, 0.75)',
          'card-solid': '#0c1533',
          border: 'rgba(56, 189, 248, 0.12)',
          neon: '#22c55e',
          lime: '#a3e635',
          gold: '#eab308',
          cyan: '#38bdf8'
        },
        team1: {
          DEFAULT: '#22c55e',
          border: '#15803d',
          glow: 'rgba(34, 197, 94, 0.4)'
        },
        team2: {
          DEFAULT: '#0ea5e9',
          border: '#0369a1',
          glow: 'rgba(14, 165, 233, 0.4)'
        },
        team3: {
          DEFAULT: '#a855f7',
          border: '#7e22ce',
          glow: 'rgba(168, 85, 247, 0.4)'
        },
        team4: {
          DEFAULT: '#f97316',
          border: '#c2410c',
          glow: 'rgba(249, 115, 22, 0.4)'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        handwriting: ['Caveat', 'Brush Script MT', 'cursive']
      },
      boxShadow: {
        'neon-green': '0 0 20px rgba(34, 197, 94, 0.45)',
        'neon-blue': '0 0 20px rgba(14, 165, 233, 0.45)',
        'neon-purple': '0 0 20px rgba(168, 85, 247, 0.45)',
        'neon-orange': '0 0 20px rgba(249, 115, 22, 0.45)',
        'card-glow': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'float': 'float 3s ease-in-out infinite'
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 12px rgba(34, 197, 94, 0.8))' },
          '50%': { opacity: 0.8, filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.4))' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' }
        }
      }
    },
  },
  plugins: [],
}
