// Visual-diff rig configuration.
//
// The ORIGINAL site (estateplanningdfw.law) is the source of truth. We diff a
// template-representative slice of routes — one URL per distinct template —
// against the local clone. Blogs, media-center, geo and estate-planning detail
// pages are all template-driven, so one representative URL each proves the
// template; full route coverage is handled by the Phase 1 parity audit, not here.

export type Viewport = { name: string; width: number; height: number }

// Phase 0 spec: 390x844 (mobile), 768x1024 (tablet), 1440x900 (desktop).
export const VIEWPORTS: Viewport[] = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
]

export const ORIGINS = {
  original: process.env.ORIGINAL_ORIGIN || 'https://www.estateplanningdfw.law',
  clone: process.env.CLONE_ORIGIN || 'http://localhost:3000',
}

export type RouteDef = {
  // URL path, identical on both origins. Always leading+trailing slash.
  path: string
  // Template family — used to group the diff report and pick worst-first order.
  template: string
}

// One representative URL per template. Children chosen from the live sitemap.
export const ROUTES: RouteDef[] = [
  { path: '/', template: 'home' },
  { path: '/about-us/', template: 'about' },
  { path: '/about-us/pricing/', template: 'pricing' },
  { path: '/staff-profiles/', template: 'staff-index' },
  { path: '/staff-profiles/justin-t-crain/', template: 'staff-profile' },
  { path: '/estate-planning/', template: 'practice-area' },
  { path: '/estate-planning/wills/', template: 'practice-area-child' },
  { path: '/estate-planning/trusts/', template: 'practice-area-child' },
  { path: '/probate/', template: 'practice-area' },
  { path: '/business-law/', template: 'practice-area' },
  { path: '/plano/', template: 'geo' },
  { path: '/mansfield/', template: 'geo' },
  { path: '/resources/', template: 'resources' },
  { path: '/reviews/', template: 'reviews' },
  { path: '/contact-us/', template: 'contact' },
  { path: '/blogs/', template: 'blog-index' },
  { path: '/blogs/2026/june/recommended-frequency-for-regular-estate-plan-re/', template: 'blog-post' },
  { path: '/media-center/', template: 'media-index' },
  { path: '/media-center/firm-videos/texas-estate-planning-crain-wooley/', template: 'media-item' },
  { path: '/site-map/', template: 'sitemap' },
]

// Computed-style probes. The original uses responsive sizes, so we capture every
// breakpoint rather than trusting a single desktop token. Each probe takes the
// first visible match; selector lists cover both the original markup and the
// clone's cw-* classes so the same logical element is measured on both sides.
export type StyleTarget = { key: string; selectors: string[] }
export const STYLE_TARGETS: StyleTarget[] = [
  { key: 'h1', selectors: ['main h1', 'h1'] },
  { key: 'h2', selectors: ['main h2', '.cw-h2', 'h2'] },
  { key: 'h3', selectors: ['main h3', 'h3'] },
  { key: 'body_p', selectors: ['main p', 'article p', '.cw-prose p', 'p'] },
  {
    key: 'btn_primary',
    selectors: ['.cw-btn-gold', 'a.cw-btn', '.button.primary', 'a.button', '[class*="btn-gold"]', 'main a[class*="btn"]'],
  },
  {
    key: 'btn_secondary',
    selectors: ['.cw-btn-outline', '.cw-btn-ghost', '.button.secondary', 'a.button.is-outline', 'main a[class*="outline"]'],
  },
  { key: 'nav_link', selectors: ['header nav a', '.cw-nav a', 'nav a'] },
  { key: 'footer_text', selectors: ['footer p', '.cw-footer p', 'footer a', 'footer'] },
]

// Computed-style properties captured per probe.
export const STYLE_PROPS = [
  'fontFamily',
  'fontSize',
  'fontWeight',
  'lineHeight',
  'letterSpacing',
  'textTransform',
  'color',
  'backgroundColor',
  'marginTop',
  'marginBottom',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'borderRadius',
] as const

// On-disk folder for a route. "/" -> "home"; nested paths flattened with "__".
export function slugFor(path: string): string {
  const trimmed = path.replace(/^\/+|\/+$/g, '')
  return trimmed === '' ? 'home' : trimmed.replace(/\//g, '__')
}

export const CAPTURE_ROOT = 'docs/reference/capture'
export const DIFF_REPORT_JSON = 'docs/reference/diff-report.json'
export const DIFF_REPORT_HTML_DIR = 'diff-report'
export const MASKS_FILE = 'scripts/visual-diff/masks.json'
export const ORIGINAL_TOKENS_FILE = 'docs/reference/original-tokens.json'
