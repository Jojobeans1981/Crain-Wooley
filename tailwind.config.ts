import type { Config } from 'tailwindcss'

/**
 * Palette + type repointed to the approved intake design
 * (wemovenewyork/crain-wooley-intake · the `cf` token set). See lib/cf.ts.
 *
 * Warm editorial-classic: slate ink #2E414F, brass #9A825E, cream #faf5ea,
 * navy-tinted ink text #1a2230. Square corners, border-as-elevation, flat
 * ink/brass buttons. arno-pro (Typekit) / Inter / JetBrains Mono.
 *
 * All historical class names (cw-navy, cw-gold, cw-ink, vault-*, etc.) are
 * preserved and remapped onto the cf values so existing markup keeps working.
 */
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
        // ── Intake design palette (cf.*) ──
        cf: {
          ink: '#2E414F',
          'ink-soft': '#3F576B',
          ivory: '#f6f1e7',
          'ivory-warm': '#ede5d3',
          cream: '#faf5ea',
          brass: '#9A825E',
          'brass-light': '#D5C0A2',
          'brass-dark': '#7A6444',
          rule: 'rgba(26,34,48,0.14)',
          'rule-soft': 'rgba(26,34,48,0.08)',
          text: '#1a2230',
          'text-mute': '#6b6356',
          danger: '#a23a2a',
        },
        // ── cw.* namespace (remapped onto cf) ──
        cw: {
          navy: '#2E414F',         // cf.ink
          'navy-light': '#3F576B', // cf.inkSoft
          'navy-dark': '#21303B',  // darker slate (derived from cf.ink)
          gold: '#9A825E',         // cf.brass
          'gold-dark': '#7A6444',  // cf.brassDark
          'gold-light': '#D5C0A2', // cf.brassLight
          cream: '#faf5ea',        // cf.cream
          'cream-deep': '#ede5d3', // cf.ivoryWarm
          ivory: '#f6f1e7',        // cf.ivory
          ink: '#1a2230',          // cf.text
          'ink-soft': '#3F576B',   // cf.inkSoft
          'ink-mute': '#6b6356',   // cf.textMute
          line: 'rgba(26,34,48,0.14)',        // cf.rule
          'line-soft': 'rgba(26,34,48,0.08)', // cf.ruleSoft
          success: '#3A7D5A',
          danger: '#a23a2a',       // cf.danger
        },
        // ── Flat aliases (bg-cw-navy, text-cw-ink, etc.) ──
        'cw-navy': '#2E414F',
        'cw-navy-light': '#3F576B',
        'cw-navy-dark': '#21303B',
        'cw-gold': '#9A825E',
        'cw-gold-dark': '#7A6444',
        'cw-gold-light': '#D5C0A2',
        'cw-gold-dim': '#7A6444', // legacy
        'cw-cream': '#faf5ea',
        'cw-cream-deep': '#ede5d3',
        'cw-ivory': '#f6f1e7',
        'cw-ink': '#1a2230',
        'cw-ink-soft': '#3F576B',
        'cw-ink-mute': '#6b6356',
        'cw-line': 'rgba(26,34,48,0.14)',
        'cw-line-soft': 'rgba(26,34,48,0.08)',
        'cw-success': '#3A7D5A',
        'cw-danger': '#a23a2a',
        // ── Legacy back-compat aliases (old class names still resolve) ──
        'cw-black': '#2E414F',  // cf.ink
        'cw-dark': '#3F576B',   // cf.inkSoft
        'cw-panel': '#f6f1e7',  // cf.ivory
        'cw-border': 'rgba(26,34,48,0.14)',
        'cw-white': '#2E414F',  // “white” text on light bg → ink
        'cw-muted': '#6b6356',  // cf.textMute
        'cw-accent': '#ede5d3', // cf.ivoryWarm
        // Legacy vault namespace → mapped onto the warm palette
        vault: {
          void: '#faf5ea',       // cf.cream
          chamber: '#f6f1e7',    // cf.ivory
          wall: '#ede5d3',       // cf.ivoryWarm
          border: 'rgba(26,34,48,0.14)',
          steel: '#6b6356',      // cf.textMute
          parchment: '#1a2230',  // cf.text
          gold: '#9A825E',       // cf.brass
          goldmute: '#7A6444',   // cf.brassDark
          warn: '#a23a2a',       // cf.danger
          safe: '#3A7D5A',
        },
      },
      fontFamily: {
        // Mirrors cf.serif / cf.sans / cf.mono (see lib/cf.ts).
        display: ['arno-pro', 'Cormorant Garamond', 'Hoefler Text', 'Times New Roman', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'Menlo', 'monospace'],
      },
      borderRadius: {
        // Source design is square-cornered (borderRadius: 0). Keep tiny radii
        // for the rare softened element; `full` stays for radio dots / pills.
        DEFAULT: '0px',
        none: '0px',
        sm: '2px',
        md: '2px',
        lg: '2px',
        xl: '2px',
        '2xl': '2px',
        full: '9999px',
      },
      transitionDuration: {
        DEFAULT: '150ms',
        slow: '300ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      boxShadow: {
        // Source uses borders for elevation, not drop-shadows. Keep keys so
        // existing `shadow-cw-*` utilities resolve, but flatten them.
        'cw-card': 'none',
        'cw-card-hover': 'none',
        'cw-button': 'none',
      },
    },
  },
  plugins: [],
}

export default config
