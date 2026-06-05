import type { Metadata } from 'next'
import {
  Hero, BadgeWall, IntroVideo, GuideBand, PracticeAreas,
  Divider, ReviewsSection, ValueProps, LatestNews, Locations,
} from '@/components/site/home/sections'

/**
 * Marketing homepage (/) — literal visual clone of estateplanningdfw.law.
 * Sections in live DOM order. SiteHeader/SiteFooter are provided by the
 * (marketing) layout. The intake landing now lives at /get-started; the intake
 * funnel remains at /qualify.
 */
export const metadata: Metadata = {
  title: 'Estate Planning Attorneys in Dallas-Fort Worth | Crain & Wooley',
  description:
    'Crain & Wooley offers comprehensive, flat-rate estate planning, probate, and business law services across the Dallas-Fort Worth area. Book a consultation today.',
  alternates: { canonical: '/' },
}

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
