'use client'
import { useEffect, useRef } from 'react'

// ── 2. Award / credential badge wall ──
// Auto-scrolling carousel with prev/next arrows, matching the original
// (Scorpion sl_ato-rsp = auto-responsive strip): one row of ~5 logos that
// auto-advances, pauses on hover, and is manually navigable. Reduced-motion
// disables the auto-advance (manual scroll only).
type Badge = { src: string; alt: string; href?: string }
const BADGES: Badge[] = [
  { src: '/home/badges/texas-bar-scholars.png', alt: 'Texas Bar College - Professional Society of Legal Scholars' },
  { src: '/home/badges/elder-counsel.png', alt: 'Elder Counsel' },
  { src: '/home/badges/texas-bar-college.png', alt: 'Texas Bar College' },
  { src: '/home/badges/naela.png', alt: 'NAELA' },
  { src: '/home/badges/martindale-client-champion.png', alt: 'Martindale-Hubbell Client Champion Gold', href: 'https://www.lawyers.com/plano/texas/justin-travis-crain-168880334-a/' },
  { src: '/home/badges/top3-2022.png', alt: '2022 Top 3 Estate Planning Lawyers in Plano', href: 'https://threebestrated.com/estate-planning-lawyers-in-plano-tx' },
  { src: '/home/badges/top3-2021.png', alt: '2021 Top 3 Estate Planning Lawyers in Plano', href: 'https://threebestrated.com/estate-planning-lawyers-in-plano-tx' },
  { src: '/home/badges/top3-2020.png', alt: '2020 Top 3 Estate Planning Lawyers in Plano', href: 'https://threebestrated.com/estate-planning-lawyers-in-plano-tx' },
  { src: '/home/badges/google-5star.png', alt: 'Google 5 Star Customer Rating', href: 'https://www.google.com/search?q=crain+and+wooley' },
  { src: '/home/badges/expertise-2022.png', alt: '2022 Expertise.com Best Probate Lawyers in Richardson', href: 'https://www.expertise.com/tx/richardson/probate-lawyers' },
  { src: '/home/badges/client-champion-2019.jpg', alt: 'Client Champion Gold Distinction' },
  { src: '/home/badges/client-champion-2020.jpg', alt: '2020 Client Champion Gold Distinction' },
  { src: '/home/badges/client-champion-2021.jpg', alt: '2021 Client Champion Gold Distinction' },
  { src: '/home/badges/client-champion-2022.jpg', alt: '2022 Client Champion Gold Distinction' },
  { src: '/home/badges/gold-client-champion-2023.png', alt: '2023 Gold Client Champion' },
]

// Natural-aspect badge (no forced box / no contain-letterboxing); height is set
// in CSS, width follows the image's own ratio — matches Scorpion's sl_ato-rsp.
function BadgeImg({ b }: { b: Badge }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="cw-badge" src={b.src} alt={b.alt} loading="lazy" />
}

function BadgeCarousel({ interior }: { interior?: boolean }) {
  const trackRef = useRef<HTMLUListElement>(null)
  const pausedRef = useRef(false)

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return // no auto-advance
    const id = setInterval(() => {
      if (pausedRef.current) return
      const first = el.querySelector('li') as HTMLElement | null
      const step = first ? Math.round(first.getBoundingClientRect().width + 44) : 180
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 8) {
        el.scrollTo({ left: 0, behavior: 'smooth' }) // loop back to the start
      } else {
        el.scrollBy({ left: step, behavior: 'smooth' })
      }
    }, 2600)
    return () => clearInterval(id)
  }, [])

  function nudge(dir: 1 | -1) {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.7), behavior: 'smooth' })
  }

  return (
    <div
      className="cw-badge-carousel"
      onMouseEnter={() => { pausedRef.current = true }}
      onMouseLeave={() => { pausedRef.current = false }}
    >
      <button type="button" className="cw-badge-nav cw-badge-prev" aria-label="Previous awards" onClick={() => nudge(-1)}>
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <ul className={`cw-badge-track${interior ? ' cw-badge-track-interior' : ''}`} ref={trackRef}>
        {BADGES.map((b) => (
          <li key={b.src} className="cw-badge-item">
            {b.href
              ? <a href={b.href} target="_blank" rel="noopener noreferrer" aria-label={b.alt}><BadgeImg b={b} /></a>
              : <BadgeImg b={b} />}
          </li>
        ))}
      </ul>
      <button type="button" className="cw-badge-nav cw-badge-next" aria-label="Next awards" onClick={() => nudge(1)}>
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    </div>
  )
}

// Homepage credential carousel (full-size).
export function BadgeWall() {
  return (
    <section className="cw-badges" aria-label="Awards and credentials">
      <BadgeCarousel />
    </section>
  )
}

// Interior pages repeat the credentials below the banner at a smaller size.
export function BadgeStrip() {
  return (
    <section className="cw-badges cw-badges-interior" aria-label="Awards and credentials">
      <BadgeCarousel interior />
    </section>
  )
}
