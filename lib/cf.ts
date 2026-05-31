/**
 * Crain & Wooley intake design tokens.
 *
 * Copied verbatim from the approved intake design
 * (wemovenewyork/crain-wooley-intake · option-counsel-final.jsx, the `cf` object).
 * These are the single source of truth for the warm editorial-classic look:
 * boxed white inputs, square corners, flat ink/brass buttons, ivory blocks.
 *
 * Do not retune these values — they must stay identical to the source so the
 * live app matches the approved design pixel-for-pixel.
 */
export const cf = {
  ink: '#2E414F',
  inkSoft: '#3F576B',
  ivory: '#f6f1e7',
  ivoryWarm: '#ede5d3',
  cream: '#faf5ea',
  brass: '#9A825E',
  brassLight: '#D5C0A2',
  brassDark: '#7A6444',
  rule: 'rgba(26,34,48,0.14)',
  ruleSoft: 'rgba(26,34,48,0.08)',
  text: '#1a2230',
  textMute: '#6b6356',
  danger: '#a23a2a',
  serif: '"arno-pro", "Cormorant Garamond", "Hoefler Text", "Times New Roman", serif',
  sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  mono: '"JetBrains Mono", ui-monospace, Menlo, monospace',
} as const

export type CfToken = keyof typeof cf

/**
 * Subtle paper-grain backdrop, used as an inline data-URL background on the
 * dark intake panel. Copied verbatim from intake-shared.jsx (PAPER_GRAIN_URL).
 */
export const PAPER_GRAIN_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'>
    <filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/>
      <feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.035 0'/></filter>
    <rect width='100%' height='100%' filter='url(#n)'/></svg>`
  )
