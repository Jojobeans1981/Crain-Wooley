import { ValueProps, ReviewsSection, Locations } from '@/components/site/home/sections'
import { Accordion } from './Accordion'
import type { FamilyBData, BodyBlock } from '@/lib/legacy/family-b'

// Render one ordered body block (paragraph, sub-heading, or list) faithfully.
// 'closer' markers are not body content — they render as full-bleed sections
// (outside the prose container), so Block ignores them.
function Block({ block, k }: { block: BodyBlock; k: number }) {
  switch (block.type) {
    case 'h2': return <h2 key={k} className="cw-fb-h2">{block.text}</h2>
    case 'h3': return <h3 key={k} className="cw-fb-h3">{block.text}</h3>
    case 'ul': return <ul key={k} className="cw-fb-ul">{block.items.map((it, j) => <li key={j}>{it}</li>)}</ul>
    case 'closer': return null
    default: return <p key={k}>{(block as { text: string }).text}</p>
  }
}

/**
 * Family-B interior template (the corrected legacy layout): full-bleed gold
 * banner -> two-column intro (copy left, framed photo right) -> accordion groups
 * (collapsed) -> the shared closer bands the original ends with. No invented
 * chrome. Renders from the structured FamilyBData model.
 *
 * Shared closers reuse the homepage section components so home + interior match:
 *   pillars -> ValueProps, testimonials -> ReviewsSection, schedule -> Locations.
 */
const CLOSER: Record<string, () => React.ReactElement> = {
  pillars: ValueProps,
  testimonials: ReviewsSection,
  schedule: Locations,
}

export default function FamilyBPage({ page }: { page: FamilyBData }) {
  // Closer bands are recorded in source order as {type:'closer'} markers within
  // bodyBlocks; render them (full-bleed) in that order. Fall back to the legacy
  // page.closers list for entries extracted before markers existed.
  const markerClosers = [...new Set(page.bodyBlocks.filter((b) => b.type === 'closer').map((b) => (b as { which: string }).which))]
  const closers = markerClosers.length ? markerClosers : page.closers
  const contentBlocks = page.bodyBlocks.filter((b) => b.type !== 'closer')
  return (
    <>
      <header className="legacy-banner legacy-banner--navy">
        <div className="cw-container legacy-banner-inner">
          <h1 className="legacy-banner-title">{page.bannerTitle}</h1>
        </div>
      </header>

      <section className="cw-fb-intro">
        {/* Two-column intro: heading + lede beside the framed photo. The lede is
            the first body blocks (up to the first sub-heading, max 3); the full
            remaining body renders below — page for page, nothing dropped. */}
        {(() => {
          let lede = page.introImage ? contentBlocks.slice(0, 3) : []
          const cut = lede.findIndex((b) => b.type === 'h2' || b.type === 'h3')
          if (cut > 0) lede = lede.slice(0, cut)
          else if (cut === 0) lede = []
          const rest = contentBlocks.slice(lede.length)
          return (
            <div className="cw-container">
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
              {rest.length > 0 && (
                <div className="cw-fb-body">
                  {rest.map((b, i) => <Block key={i} block={b} k={i} />)}
                </div>
              )}
            </div>
          )
        })()}
      </section>

      {page.accordionGroups.map((g, i) => (
        <section key={i} className="cw-fb-accgroup">
          <div className="cw-container">
            {g.heading && <h2 className="cw-h2 cw-fb-acc-heading">{g.heading}</h2>}
            {g.instruction && <p className="cw-fb-instruction">{g.instruction}</p>}
            <Accordion items={g.items} />
          </div>
        </section>
      ))}

      {closers.map((c) => {
        const C = CLOSER[c]
        return C ? <C key={c} /> : null
      })}
    </>
  )
}
