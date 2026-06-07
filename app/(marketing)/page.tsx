import {
  Hero, BadgeWall, IntroVideo, GuideBand, PracticeAreas,
  Divider, ReviewsSection, ValueProps, LatestNews, Locations,
} from '@/components/site/home/sections'
import { pageMetadata } from '@/lib/seo'

/**
 * Marketing homepage (/) — literal visual clone of estateplanningdfw.law.
 * Sections in live DOM order. SiteHeader/SiteFooter are provided by the
 * (marketing) layout. The intake landing now lives at /get-started; the intake
 * funnel remains at /qualify.
 *
 * Title + description are set to the live site's EXACT strings for ranking
 * continuity through the migration.
 */
export const metadata = pageMetadata({
  title: 'Dallas-Fort Worth Estate Planning Attorneys | Crain & Wooley',
  description:
    'Protect your assets with our qualified Dallas-Fort Worth estate planning attorneys. We build customized wills and trusts. Call us today to secure your legacy.',
  path: '/',
  type: 'website',
})

export default function HomePage() {
  return (
    <>
      <Hero />
      <BadgeWall />
      <IntroVideo />
      <GuideBand />
      <PracticeAreas />
      <Divider />
      <ReviewsSection />
      <ValueProps />
      <LatestNews />
      <Locations />
    </>
  )
}
