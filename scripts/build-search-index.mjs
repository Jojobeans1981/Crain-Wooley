/**
 * Build the client-side search index.
 *
 * Reads the static content already in the repo and writes a SLIM
 * public/search-index.json (one record per page; full body dropped to keep the
 * payload small). Runs automatically as the npm "prebuild"/"predev" step; a
 * generated copy is also committed so dev works with no manual step.
 *
 *   node scripts/build-search-index.mjs
 *
 * Sources: lib/legacy/legacy-pages.json (331 pages, incl. blog posts),
 * lib/legacy/blog-index.json (clean blog titles), and the Learning Center
 * pillars + quizzes (the learn data is TS, so the small static list lives here).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'))

const legacy = read('lib/legacy/legacy-pages.json')
const blogIndex = read('lib/legacy/blog-index.json')
const blogTitle = new Map(blogIndex.map((b) => [b.path, b.title]))

// ── Persona tagging ─────────────────────────────────────────────────────────
// OVERRIDES (the curated source of truth) is read STRAIGHT from personas.ts so it
// stays single-source — edit it there only. Heuristics are mirrored below (they
// rarely change; keep in sync with lib/learn/personas.ts §PERSONAS[*].heuristics).
const personasSrc = readFileSync(join(ROOT, 'lib/learn/personas.ts'), 'utf8')
const ovMatch = personasSrc.match(/export const OVERRIDES[^=]*=\s*(\{[\s\S]*?\n\})/)
const OVERRIDES = ovMatch ? new Function(`return ${ovMatch[1]}`)() : {}
if (!ovMatch) console.warn('⚠ could not read OVERRIDES from personas.ts — persona tags will be auto-only')

const PERSONA_HEURISTICS = {
  'young-families': ['minor child', 'minor children', 'guardian for', 'guardianship of a minor', 'young children', 'first will', 'new parent', 'naming a guardian'],
  retirees: ['long-term care', 'long term care', 'medicaid', 'nursing home', 'elder law', 'retirement', 'incapacit', 'aging', 'later life'],
  'business-owners': ['business succession', 'business owner', 'closely held', 'buy-sell', 'partnership', 'company', 'succession plan'],
  'blended-families': ['blended', 'remarriage', 'second marriage', 'stepchild', 'step-child', 'prenup', 'postnup', 'pre-postnuptial', 'prior relationship', 'prior marriage'],
  'high-net-worth': ['estate tax', 'gift tax', 'asset protection', 'high net worth', 'high-net-worth', 'irrevocable trust', 'charitable trust', 'generation-skipping', 'wealth'],
  'special-needs': ['special needs', 'supplemental needs', 'disability', 'disabled', 'conservatorship', 'adult guardianship', 'snt', 'government benefits'],
}

/** Personas whose heuristics appear in the record's text. */
function suggestPersonas(rec) {
  const text = `${rec.title} ${rec.headings} ${rec.excerpt} ${rec.keywords}`.toLowerCase()
  return Object.entries(PERSONA_HEURISTICS)
    .filter(([, hs]) => hs.some((h) => text.includes(h)))
    .map(([slug]) => slug)
}

const SMALL = new Set(['of', 'and', 'the', 'for', 'to', 'a', 'in', 'on', 'or', 'with'])
const humanize = (seg) =>
  seg.split('-').map((w, i) => (i > 0 && SMALL.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1))).join(' ')

// Top-level section label for the result's breadcrumb line.
function sectionLabel(url) {
  const seg = url.replace(/^\//, '').split('/')[0] || ''
  if (seg === 'blogs') return 'Blog'
  if (seg === 'learn') return 'Learning Center'
  if (!seg) return 'Crain & Wooley'
  return humanize(seg)
}

const stripSuffix = (t) => (t || '').replace(/\s*\|\s*Crain & Wooley\s*$/i, '').trim()

function excerpt(body, words = 30) {
  const clean = (body || '').replace(/\s+/g, ' ').trim()
  if (!clean) return ''
  const parts = clean.split(' ')
  return parts.length <= words ? clean : parts.slice(0, words).join(' ') + '…'
}

const records = []

// ── Legacy pages (services, resources, locations, staff, blog posts, …) ──
for (const [url, p] of Object.entries(legacy)) {
  const isBlog = p.type === 'blog_post'
  const title = stripSuffix(isBlog ? blogTitle.get(url) || p.h1 || p.title : p.h1 || p.title)
  if (!title) continue
  const headings = [...(p.h2s || []), ...(p.h3s || [])].join(' · ')
  records.push({
    url,
    title,
    type: isBlog ? 'blog' : 'page',
    section: isBlog ? 'Blog' : sectionLabel(url),
    headings,
    excerpt: excerpt(p.body),
    keywords: [sectionLabel(url), humanize(url.split('/').filter(Boolean).pop() || '')].join(' '),
  })
}

// ── Learning Center hub + pillars (mirrors lib/learn/pillars.ts) ──
const PILLARS = [
  { slug: 'trusts', title: 'Trusts Explained', blurb: 'What they are, revocable vs. irrevocable, and how they avoid probate.' },
  { slug: 'probate', title: 'Probate in Texas', blurb: "What probate is, when it's required, and how to make it easier." },
  { slug: 'wills', title: 'Wills & the Basics', blurb: 'The foundation: wills, guardianship, and your first documents.' },
  { slug: 'powers-of-attorney', title: 'Powers of Attorney & Incapacity', blurb: "Who decides for you if you can't — financial and medical." },
  { slug: 'medicaid-long-term-care', title: 'Medicaid & Long-Term Care', blurb: "Plan for care costs without draining everything you've saved." },
  { slug: 'special-needs', title: 'Special Needs & Disability', blurb: 'Provide for a loved one without risking their benefits.' },
  { slug: 'business-succession', title: 'Business Succession', blurb: 'Keep a family business running through any transition.' },
  { slug: 'family-situations', title: 'Family & Life Situations', blurb: 'Blended families, marriage, inheritance, and digital assets.' },
  { slug: 'tax-estate-planning', title: 'Tax & Legacy Planning', blurb: 'Reduce estate tax, protect assets, and give to causes you love.' },
]

records.push({
  url: '/learn',
  title: 'Learning Center',
  type: 'learn',
  section: 'Learning Center',
  headings: 'Estate planning, explained in plain language',
  excerpt: 'Plain-language guides to wills, trusts, probate, and protecting the people you love across Texas.',
  keywords: 'learn education guides estate planning explained',
})
for (const p of PILLARS) {
  records.push({
    url: `/learn/${p.slug}`,
    title: p.title,
    type: 'learn',
    section: 'Learning Center',
    headings: '',
    excerpt: p.blurb,
    keywords: `${p.title} guide ${humanize(p.slug)}`,
  })
}

// ── Quizzes (app/(learn)/learn/quizzes/*) ──
const QUIZZES = [
  { slug: 'do-you-need-a-trust', title: 'Do You Need a Trust?', blurb: 'A two-minute quiz: tell us about your family and assets and we will say whether a trust is worth a conversation.' },
  { slug: 'do-you-need-probate', title: 'Do You Need Probate?', blurb: 'A short quiz to gauge whether an estate is likely to need probate in Texas.' },
  { slug: 'which-plan-do-i-need', title: 'Which Plan Do I Need?', blurb: 'Answer a few questions to see which estate-planning documents fit your situation.' },
]
for (const q of QUIZZES) {
  records.push({
    url: `/learn/quizzes/${q.slug}`,
    title: q.title,
    type: 'quiz',
    section: 'Learning Center',
    headings: '',
    excerpt: q.blurb,
    keywords: `${q.title} quiz`,
  })
}

// ── Persona tagging pass (additive): final = OVERRIDES[path] ?? suggested ──
const report = []
const personaCounts = {}
const sourceCounts = { override: 0, auto: 0, none: 0 }
for (const rec of records) {
  const override = OVERRIDES[rec.url]
  const suggested = suggestPersonas(rec)
  const personas = override ?? suggested
  const personaSource = override ? 'override' : personas.length ? 'auto' : 'none'
  rec.personas = personas
  rec.personaSource = personaSource
  sourceCounts[personaSource]++
  for (const p of personas) personaCounts[p] = (personaCounts[p] || 0) + 1
  report.push({ url: rec.url, type: rec.type, personas, personaSource })
}

mkdirSync(join(ROOT, 'public'), { recursive: true })
writeFileSync(join(ROOT, 'public/search-index.json'), JSON.stringify(records))
writeFileSync(
  join(ROOT, 'lib/learn/persona-report.json'),
  JSON.stringify({ generatedFrom: 'scripts/build-search-index.mjs', sourceCounts, personaCounts, pages: report }, null, 2) + '\n',
)

const counts = records.reduce((a, r) => ((a[r.type] = (a[r.type] || 0) + 1), a), {})
console.log(`search index → public/search-index.json (${records.length} records)`, counts)
console.log('persona tagging → lib/learn/persona-report.json | source:', sourceCounts, '| per-persona:', personaCounts)
