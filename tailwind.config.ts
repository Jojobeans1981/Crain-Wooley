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
        // ── New brand palette (matches estateplanningdfw.law) ──
        // Both the nested `cw.*` namespace and the flat `cw-*` aliases are
        // declared so utilities like bg-cw-navy and bg-cw/navy both resolve
        // depending on Tailwind version and prior class usage in the codebase.
        cw: {
          navy: '#0B1D35',
          'navy-light': '#143157',
          'navy-dark': '#06121F',
          gold: '#C5933A',
          'gold-dark': '#A87A28',
          'gold-light': '#E0B25F',
          cream: '#F7F2E9',
          'cream-deep': '#EFE7D6',
          ivory: '#FBF8F2',
          ink: '#1A1A1A',
          'ink-soft': '#4A4A4A',
          'ink-mute': '#7A7A7A',
          line: '#E2D9C6',
          'line-soft': '#EFE7D6',
          success: '#3A7D5A',
          danger: '#B23A2A',
        },
        // ── Flat aliases (used as bg-cw-navy, text-cw-ink, etc.) ──
        'cw-navy': '#0B1D35',
        'cw-navy-light': '#143157',
        'cw-navy-dark': '#06121F',
        'cw-gold': '#C5933A',
        'cw-gold-dark': '#A87A28',
        'cw-gold-light': '#E0B25F',
        'cw-gold-dim': '#A87A28', // legacy
        'cw-cream': '#F7F2E9',
        'cw-cream-deep': '#EFE7D6',
        'cw-ivory': '#FBF8F2',
        'cw-ink': '#1A1A1A',
        'cw-ink-soft': '#4A4A4A',
        'cw-ink-mute': '#7A7A7A',
        'cw-line': '#E2D9C6',
        'cw-line-soft': '#EFE7D6',
        'cw-success': '#3A7D5A',
        'cw-danger': '#B23A2A',
        // ── Legacy back-compat aliases (so the old class names still work) ──
        'cw-black': '#0B1D35',
        'cw-dark': '#143157',
        'cw-panel': '#FBF8F2',
        'cw-border': '#E2D9C6',
        'cw-white': '#0B1D35',   // “white” text on light bg → navy ink
        'cw-muted': '#7A7A7A',
        'cw-accent': '#EFE7D6',
        // Legacy vault namespace (tracker code used this before) → mapped to new
        vault: {
          void: '#F7F2E9',
          chamber: '#FBF8F2',
          wall: '#EFE7D6',
          border: '#E2D9C6',
          steel: '#7A7A7A',
          parchment: '#1A1A1A',
          gold: '#C5933A',
          goldmute: '#A87A28',
          warn: '#B23A2A',
          safe: '#3A7D5A',
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        // mono kept for legacy refs but points at sans — no real monospace in new design
        mono: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '4px',
        sm: '2px',
        md: '6px',
        lg: '10px',
      },
      transitionDuration: {
        DEFAULT: '200ms',
        slow: '350ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      boxShadow: {
        'cw-card': '0 1px 3px rgba(11,29,53,0.06), 0 8px 24px rgba(11,29,53,0.04)',
        'cw-card-hover': '0 4px 10px rgba(11,29,53,0.08), 0 16px 40px rgba(11,29,53,0.08)',
        'cw-button': '0 1px 2px rgba(11,29,53,0.18)',
      },
    },
  },
  plugins: [],
}

export default config
