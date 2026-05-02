import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './types/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        vault: {
          void: '#0B0D11',
          chamber: '#111318',
          wall: '#1A1D24',
          border: '#2A2D35',
          steel: '#6B7B8E',
          parchment: '#E8E2D6',
          gold: '#C5933A',
          goldmute: '#8A6422',
          warn: '#D95D39',
          safe: '#3A7D5A',
        },
        // Back-compat aliases for existing pages/components.
        'cw-black': '#0B0D11',
        'cw-dark': '#1A1D24',
        'cw-panel': '#111318',
        'cw-border': '#2A2D35',
        'cw-gold': '#C5933A',
        'cw-gold-dim': '#8A6422',
        'cw-white': '#E8E2D6',
        'cw-muted': '#6B7B8E',
        'cw-success': '#3A7D5A',
        'cw-danger': '#D95D39',
        'cw-accent': '#1A1D24',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        mono: ['IBM Plex Mono', 'Courier New', 'monospace'],
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0px',
        sm: '2px',
      },
      transitionDuration: {
        DEFAULT: '150ms',
        slow: '300ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}

export default config
