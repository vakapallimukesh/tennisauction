/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0a0d14',
          surface: '#111722',
          card: '#161e2e',
          border: '#232e42',
          neon: '#00e676',
          neonHover: '#00c864',
          accent: '#38bdf8',
          warning: '#f59e0b',
          danger: '#ef4444',
          purple: '#a855f7'
        },
        "surface-tint": "#c8c6c8",
        "secondary-fixed": "#e4e1ea",
        "on-primary-container": "#7a797b",
        "on-primary": "#313032",
        "inverse-surface": "#e2e1eb",
        "on-secondary": "#303036",
        "secondary": "#c8c5cd",
        "on-primary-fixed-variant": "#474649",
        "on-tertiary": "#003911",
        "primary-fixed-dim": "#c8c6c8",
        "secondary-container": "#47464d",
        "on-surface-variant": "#c8c5ca",
        "error-container": "#93000a",
        "on-secondary-fixed": "#1b1b21",
        "primary-fixed": "#e5e1e4",
        "tertiary-container": "#000e02",
        "secondary-fixed-dim": "#c8c5cd",
        "on-primary-fixed": "#1c1b1d",
        "on-background": "#e2e1eb",
        "surface-container-low": "#1a1b22",
        "on-error": "#690005",
        "primary": "#c8c6c8",
        "tertiary-fixed": "#6bff83",
        "tertiary-fixed-dim": "#00e55b",
        "surface-bright": "#383940",
        "on-surface": "#e2e1eb",
        "on-tertiary-container": "#008d35",
        "on-tertiary-fixed": "#002107",
        "primary-container": "#0a0a0c",
        "on-secondary-fixed-variant": "#47464d",
        "surface-dim": "#12131a",
        "outline-variant": "#47464a",
        "surface-container-lowest": "#0d0e14",
        "surface": "#12131a",
        "on-error-container": "#ffdad6",
        "inverse-on-surface": "#2f3037",
        "background": "#12131a",
        "on-secondary-container": "#b6b4bc",
        "surface-variant": "#33343c",
        "surface-container": "#1e1f26",
        "tertiary": "#00e55b",
        "inverse-primary": "#5f5e60",
        "surface-container-high": "#282a31",
        "outline": "#919095",
        "error": "#ffb4ab",
        "surface-container-highest": "#33343c",
        "on-tertiary-fixed-variant": "#00531b",
        // Retain team colors for compatibility
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
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2.5rem",
        "gutter": "1.5rem",
        "margin": "2rem"
      },
      fontFamily: {
        "label-md": ["'Plus Jakarta Sans'", "sans-serif"],
        "body-md": ["'Plus Jakarta Sans'", "sans-serif"],
        "body-lg": ["'Plus Jakarta Sans'", "sans-serif"],
        "headline-sm": ["'Space Grotesk'", "sans-serif"],
        "headline-md": ["'Space Grotesk'", "sans-serif"],
        "headline-lg": ["'Space Grotesk'", "sans-serif"],
        "sans": ["'Plus Jakarta Sans'", "'Space Grotesk'", "sans-serif"],
        "display": ["'Space Grotesk'", "sans-serif"]
      },
      fontSize: {
        "label-md": ["12px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600" }],
        "body-md": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
        "headline-md": ["28px", { "lineHeight": "36px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "headline-sm": ["20px", { "lineHeight": "28px", "fontWeight": "600" }],
        "headline-lg": ["40px", { "lineHeight": "48px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "body-lg": ["16px", { "lineHeight": "24px", "fontWeight": "400" }]
      },
      boxShadow: {
        'neon-green': '0 0 20px rgba(0, 229, 91, 0.45)',
        'neon-blue': '0 0 20px rgba(14, 165, 233, 0.45)',
        'neon-purple': '0 0 20px rgba(168, 85, 247, 0.45)',
        'neon-orange': '0 0 20px rgba(249, 115, 22, 0.45)',
        'card-glow': '0 8px 32px 0 rgba(0, 0, 0, 0.45)'
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'float': 'float 3s ease-in-out infinite'
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 12px rgba(0, 229, 91, 0.8))' },
          '50%': { opacity: '0.8', filter: 'drop-shadow(0 0 4px rgba(0, 229, 91, 0.4))' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' }
        }
      }
    }
  },
  plugins: [],
}
