import { ValueProps, ReviewsSection, Locations } from '@/components/site/home/sections'
import { BadgeStrip } from '@/components/site/home/BadgeWall'
import { Accordion } from './Accordion'
import { Sidebar } from './Sidebar'
import type { FamilyBData, BodyBlock, Band, SidebarBlock } from '@/lib/legacy/family-b'

// Render one ordered body block (paragraph, sub-heading, or list) faithfully.
function Block({ block, k }: { block: BodyBlock; k: number }) {
  switch (block.type) {
    case 'h2': return <h2 key={k} className="cw-fb-h2">{block.text}</h2>
    case 'h3': return <h3 key={k} className="cw-fb-h3">{block.text}</h3>
    case 'ul': return <ul key={k} className="cw-fb-ul">{block.items.map((it, j) => <li key={j}>{it}</li>)}</ul>
    case 'closer': return null
    default: return <p key={k}>{(block as { text: string }).text}</p>
  }
}

// Shared closer bands so home + interior match: pillars -> ValueProps,
// testimonials -> ReviewsSection, schedule -> Locations.
const CLOSER: Record<string, () => React.ReactElement> = {
  pillars: ValueProps,
  testimonials: ReviewsSection,
  schedule: Locations,
}

function Banner({ page }: { page: FamilyBData }) {
  return (
    <header className="legacy-banner legacy-banner--navy">
      <div className="cw-container legacy-banner-inner">
        <h1 className="legacy-banner-title">{page.bannerTitle}</h1>
        {page.bannerSearch && (
          <form className="legacy-banner-search" action="/site-search" method="get" role="search">
            <input type="search" name="q" aria-label="Search the site" placeholder="Search" />
            <button type="submit" aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          </form>
        )}
      </div>
    </header>
  )
}

// Two-column intro: lede beside the framed photo, then the remaining body.
// `subhead` (when supplied) is the following accordion's instruction, hoisted to
// sit between the heading and the lede — the original's source order on the pricing
// pages (heading y0 / "Expand Each Section…" H5 y167 / lede y242).
function Intro({ band, subhead }: { band: Extract<Band, { kind: 'intro' }>; subhead?: string }) {
  let lede = band.image ? band.blocks.slice(0, 3) : []
  const cut = lede.findIndex((b) => b.type === 'h2' || b.type === 'h3')
  if (cut > 0) lede = lede.slice(0, cut)
  else if (cut === 0) lede = []
  const rest = band.blocks.slice(lede.length)
  return (
    <>
      <div className={`cw-fb-intro-grid${band.image ? '' : ' cw-fb-intro-grid--noimg'}`}>
        <div className="cw-fb-intro-copy">
          {band.heading && <h2 className="cw-fb-h1">{band.heading}</h2>}
          {subhead && <h5 className="cw-fb-subhead">{subhead}</h5>}
          {lede.map((b, i) => <Block key={i} block={b} k={i} />)}
        </div>
        {band.image && (
          <div className="cw-fb-intro-media">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={band.image} alt="" loading="lazy" />
          </div>
        )}
      </div>
      {rest.length > 0 && <div className="cw-fb-body">{rest.map((b, i) => <Block key={i} block={b} k={i} />)}</div>}
    </>
  )
}

// A flow band (intro / prose / collapsed accordion) inside the content column.
// `introSubhead` hoists the accordion instruction into the intro; `suppressInstruction`
// stops the accordion from rendering it a second time once it has been hoisted.
function FlowBand({ band, introSubhead, suppressInstruction }: { band: Band; introSubhead?: string; suppressInstruction?: boolean }) {
  if (band.kind === 'intro') return <Intro band={band} subhead={introSubhead} />
  if (band.kind === 'prose') return <div className="cw-fb-body">{band.blocks.map((b, i) => <Block key={i} block={b} k={i} />)}</div>
  if (band.kind === 'accordion') return (
    <div className="cw-fb-accgroup">
      {band.heading && <h2 className="cw-h2 cw-fb-acc-heading">{band.heading}</h2>}
      {band.instruction && !suppressInstruction && <p className="cw-fb-instruction">{band.instruction}</p>}
      <Accordion items={band.items} />
    </div>
  )
  return null
}

function ContentSection({ bands, sidebar }: { bands: Band[]; sidebar?: SidebarBlock[] }) {
  // Two-column intro split (the original #FAQsS2 layout): when an intro WITH an
  // image is followed by a collapsed accordion (the pricing plan-accordion pages),
  // the original puts heading + lede + accordions in a LEFT ~593px column with the
  // photo pinned TOP-RIGHT (519px, not spanning). The `--introsplit` modifier drives
  // that via CSS (content padding-right reserves the right column; the intro photo
  // is absolutely positioned). Other pages (staff intro w/o accordion, geo) are
  // unaffected.
  const first = bands[0]
  const introSplit = !sidebar && first?.kind === 'intro' && !!(first as Extract<Band, { kind: 'intro' }>).image && bands.some((b) => b.kind === 'accordion')
  // On the introsplit (pricing) pages the original renders the accordion's
  // instruction as an H5 subhead between the intro heading and the lede. Hoist it
  // into the intro and suppress it on the accordion so it shows exactly once.
  const acc = introSplit ? (bands.find((b) => b.kind === 'accordion' && (b as Extract<Band, { kind: 'accordion' }>).instruction) as Extract<Band, { kind: 'accordion' }> | undefined) : undefined
  const hoist = acc?.instruction
  return (
    <section className={`cw-fb-main${introSplit ? ' cw-fb-main--introsplit' : ''}`}>
      <div className="cw-container">
        <div className={`cw-fb-layout${sidebar ? ' cw-fb-layout--left' : ' cw-fb-layout--full'}`}>
          {sidebar && <aside className="cw-fb-sidebar"><Sidebar blocks={sidebar} /></aside>}
          <div className={`cw-fb-content${introSplit ? ' cw-fb-content--introsplit' : ''}`}>
            {bands.map((b, i) => <FlowBand key={i} band={b} introSubhead={hoist && b === first ? hoist : undefined} suppressInstruction={!!hoist && b === acc} />)}
          </div>
        </div>
      </div>
    </section>
  )
}

// The original's FAQ closer (#FAQsS3): a navy full-bleed band with a COLLAPSED
// gold question-bar accordion (serif white question, right chevron, navy gaps
// between gold bars), answers hidden until expanded.
function FaqBand({ band }: { band: Extract<Band, { kind: 'accordion' }> }) {
  return (
    <section className="cw-faqband" aria-label={band.heading || 'Frequently asked questions'}>
      <div className="cw-container">
        <div className="cw-faqband-head">
          {band.heading && <h2 className="cw-h2 cw-h2-light cw-faqband-title">{band.heading}</h2>}
        </div>
        <div className="cw-faqband-acc">
          {band.items.map((it, i) => (
            <details key={i} className="cw-faqbar">
              <summary className="cw-faqbar-head">
                <span className="cw-faqbar-q">{it.title}</span>
                <svg className="cw-faqbar-chev" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </summary>
              <div className="cw-faqbar-body">
                {it.body.split(/\n+/).filter(Boolean).map((para, j) => <p key={j}>{para}</p>)}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

// Light value-card panel (#CTAsS7) — centered heading + lead paragraph + a
// 3-up grid of value cards on a soft panel. Full-bleed.
function CardSection({ band }: { band: Extract<Band, { kind: 'cards' }> }) {
  return (
    <section className="cw-cardsec" aria-label={band.heading || 'Services'}>
      <div className="cw-container">
        <div className="cw-cardsec-panel">
          {band.heading && <h2 className="cw-cardsec-title">{band.heading}</h2>}
          {band.para && <p className="cw-cardsec-lead">{band.para}</p>}
          <ul className="cw-cardsec-grid">
            {band.items.map((it, i) => (
              <li key={i} className="cw-cardsec-card">
                <h3 className="cw-cardsec-card-title">{it.title}</h3>
                {it.body && <p className="cw-cardsec-card-body">{it.body}</p>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/**
 * Family-B interior template. Renders the ordered `bands` model so the original's
 * band interleaving is reproduced (flow bands — intro/prose/collapsed-accordion —
 * sit in the content column; bleed bands — expanded FAQ + closers — break full
 * width). Falls back to the legacy flat model for not-yet-re-extracted pages.
 */
function BandPage({ page }: { page: FamilyBData }) {
  const bands = page.bands!
  const hasSidebar = !!(page.sidebar && page.sidebar.length > 0)
  const isBleed = (b: Band) => b.kind === 'closer' || b.kind === 'cards' || (b.kind === 'accordion' && b.expanded)
  const out: React.ReactNode[] = []
  let flow: Band[] = []
  let sidebarUsed = false
  const flush = () => {
    if (!flow.length) return
    const useSidebar = hasSidebar && !sidebarUsed
    sidebarUsed = sidebarUsed || useSidebar
    out.push(<ContentSection key={`c${out.length}`} bands={flow} sidebar={useSidebar ? page.sidebar! : undefined} />)
    flow = []
  }
  bands.forEach((b, i) => {
    if (!isBleed(b)) { flow.push(b); return }
    flush()
    if (b.kind === 'closer') { const C = CLOSER[b.which]; if (C) out.push(<C key={`b${i}`} />) }
    else if (b.kind === 'cards') out.push(<CardSection key={`b${i}`} band={b} />)
    else out.push(<FaqBand key={`b${i}`} band={b} />)
  })
  flush()
  // Footer top-padding parity (matches the original's `main:has(> section:last-child
  // :is(.pd_v.alt-bg, …))` rule). The original wraps a TRAILING testimonials→schedule
  // pair into a no-pad `img-grp` group, so the footer KEEPS its 106px top padding;
  // every other ending leaves a self-padded closer (`pd_v`) as the last section,
  // collapsing the footer top padding to 0. Emit a marker for the flush case; the
  // global footer CSS reads `.cw-page:has(.cw-foot-flush)`.
  const last = bands[bands.length - 1]
  const prev = bands[bands.length - 2]
  const groupedClose = !!prev && prev.kind === 'closer' && prev.which === 'testimonials' && !!last && last.kind === 'closer' && last.which === 'schedule'
  return (
    <>
      <Banner page={page} />
      {page.badgeStrip && <BadgeStrip />}
      {out}
      {!groupedClose && <span className="cw-foot-flush" hidden aria-hidden="true" />}
    </>
  )
}

// Legacy renderer for entries without the `bands` model (the not-yet-re-extracted
// pages): body + accordions in the content column, then all closers at the end.
function LegacyFamilyBPage({ page }: { page: FamilyBData }) {
  const markerClosers = [...new Set(page.bodyBlocks.filter((b) => b.type === 'closer').map((b) => (b as { which: string }).which))]
  const closers = markerClosers.length ? markerClosers : page.closers
  const contentBlocks = page.bodyBlocks.filter((b) => b.type !== 'closer')
  const hasSidebar = !!(page.sidebar && page.sidebar.length > 0)
  let lede = page.introImage ? contentBlocks.slice(0, 3) : []
  const cut = lede.findIndex((b) => b.type === 'h2' || b.type === 'h3')
  if (cut > 0) lede = lede.slice(0, cut)
  else if (cut === 0) lede = []
  const rest = contentBlocks.slice(lede.length)
  return (
    <>
      <Banner page={page} />
      {page.badgeStrip && <BadgeStrip />}
      <section className="cw-fb-main">
        <div className="cw-container">
          <div className={`cw-fb-layout${hasSidebar ? '' : ' cw-fb-layout--full'}`}>
            <div className="cw-fb-content">
              <div className={`cw-fb-intro-grid${page.introImage && lede.length ? '' : ' cw-fb-intro-grid--noimg'}`}>
                <div className="cw-fb-intro-copy">
                  {page.contentH1 && <h2 className="cw-fb-h1">{page.contentH1}</h2>}
                  {lede.map((b, i) => <Block key={i} block={b} k={i} />)}
                </div>
                {page.introImage && lede.length > 0 && (
                  <div className="cw-fb-intro-media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={page.introImage} alt="" loading="lazy" />
                  </div>
                )}
              </div>
              {rest.length > 0 && <div className="cw-fb-body">{rest.map((b, i) => <Block key={i} block={b} k={i} />)}</div>}
              {page.accordionGroups.map((g, i) => (
                <div key={i} className="cw-fb-accgroup">
                  {g.heading && <h2 className="cw-h2 cw-fb-acc-heading">{g.heading}</h2>}
                  {g.instruction && <p className="cw-fb-instruction">{g.instruction}</p>}
                  <Accordion items={g.items} />
                </div>
              ))}
            </div>
            {hasSidebar && <aside className="cw-fb-sidebar"><Sidebar blocks={page.sidebar!} /></aside>}
          </div>
        </div>
      </section>
      {closers.map((c) => { const C = CLOSER[c]; return C ? <C key={c} /> : null })}
    </>
  )
}

export default function FamilyBPage({ page }: { page: FamilyBData }) {
  return page.bands && page.bands.length ? <BandPage page={page} /> : <LegacyFamilyBPage page={page} />
}
