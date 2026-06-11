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
function Intro({ band }: { band: Extract<Band, { kind: 'intro' }> }) {
  let lede = band.image ? band.blocks.slice(0, 3) : []
  const cut = lede.findIndex((b) => b.type === 'h2' || b.type === 'h3')
  if (cut > 0) lede = lede.slice(0, cut)
  else if (cut === 0) lede = []
  const rest = band.blocks.slice(lede.length)
  return (
    <>
      <div className={`cw-fb-intro-grid${band.image && lede.length ? '' : ' cw-fb-intro-grid--noimg'}`}>
        <div className="cw-fb-intro-copy">
          {band.heading && <h2 className="cw-fb-h1">{band.heading}</h2>}
          {lede.map((b, i) => <Block key={i} block={b} k={i} />)}
        </div>
        {band.image && lede.length > 0 && (
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
function FlowBand({ band }: { band: Band }) {
  if (band.kind === 'intro') return <Intro band={band} />
  if (band.kind === 'prose') return <div className="cw-fb-body">{band.blocks.map((b, i) => <Block key={i} block={b} k={i} />)}</div>
  if (band.kind === 'accordion') return (
    <div className="cw-fb-accgroup">
      {band.heading && <h2 className="cw-h2 cw-fb-acc-heading">{band.heading}</h2>}
      {band.instruction && <p className="cw-fb-instruction">{band.instruction}</p>}
      <Accordion items={band.items} />
    </div>
  )
  return null
}

function ContentSection({ bands, sidebar }: { bands: Band[]; sidebar?: SidebarBlock[] }) {
  return (
    <section className="cw-fb-main">
      <div className="cw-container">
        <div className={`cw-fb-layout${sidebar ? '' : ' cw-fb-layout--full'}`}>
          <div className="cw-fb-content">
            {bands.map((b, i) => <FlowBand key={i} band={b} />)}
          </div>
          {sidebar && <aside className="cw-fb-sidebar"><Sidebar blocks={sidebar} /></aside>}
        </div>
      </div>
    </section>
  )
}

// The original's expanded FAQ closer: a navy full-bleed band (#FAQsS3) with the
// questions + answers shown (not collapsed). dk-bg alt-bg = navy slate #304451.
function FaqBand({ band }: { band: Extract<Band, { kind: 'accordion' }> }) {
  return (
    <section className="cw-faqband" aria-label={band.heading || 'Frequently asked questions'}>
      <div className="cw-container">
        <div className="cw-faqband-head">
          {band.heading && <h2 className="cw-h2 cw-h2-light cw-faqband-title">{band.heading}</h2>}
          <span className="cw-loc-flair" aria-hidden="true" />
        </div>
        <div className="cw-faqband-list">
          {band.items.map((it, i) => (
            <div key={i} className="cw-faqband-item">
              <h3 className="cw-faqband-q">{it.title}</h3>
              {it.body.split(/\n+/).filter(Boolean).map((para, j) => <p key={j} className="cw-faqband-a">{para}</p>)}
            </div>
          ))}
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
  const isBleed = (b: Band) => b.kind === 'closer' || (b.kind === 'accordion' && b.expanded)
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
    else out.push(<FaqBand key={`b${i}`} band={b} />)
  })
  flush()
  return (
    <>
      <Banner page={page} />
      {page.badgeStrip && <BadgeStrip />}
      {out}
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
