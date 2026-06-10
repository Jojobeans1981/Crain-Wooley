import { ValueProps, ReviewsSection, Locations } from '@/components/site/home/sections'
import { Accordion } from './Accordion'
import type { FamilyBData } from '@/lib/legacy/family-b'

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
  return (
    <>
      <header className="legacy-banner legacy-banner--gold">
        <div className="cw-container legacy-banner-inner">
          <h1 className="legacy-banner-title">{page.bannerTitle}</h1>
        </div>
      </header>

      <section className="cw-fb-intro">
        <div className={`cw-container cw-fb-intro-grid${page.introImage ? '' : ' cw-fb-intro-grid--noimg'}`}>
          <div className="cw-fb-intro-copy">
            {page.contentH1 && <h2 className="cw-fb-h1">{page.contentH1}</h2>}
            {page.introBody.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          {page.introImage && (
            <div className="cw-fb-intro-media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={page.introImage} alt="" loading="lazy" />
            </div>
          )}
        </div>
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

      {page.closers.map((c) => {
        const C = CLOSER[c]
        return C ? <C key={c} /> : null
      })}
    </>
  )
}
