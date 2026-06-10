// ── 2. Award / credential badge wall ──
// Static, centered, evenly-spaced row — matching the original, which presents
// the credentials as a fixed row (no marquee, no arrow carousel, no scroll).
// Server-renderable; no client JS.
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

function BadgeRow() {
  return (
    <ul className="cw-badge-track">
      {BADGES.map((b) => (
        <li key={b.src} className="cw-badge-item">
          {b.href
            ? <a href={b.href} target="_blank" rel="noopener noreferrer" aria-label={b.alt}><BadgeImg b={b} /></a>
            : <BadgeImg b={b} />}
        </li>
      ))}
    </ul>
  )
}

// Homepage credential row (full-size badges).
export function BadgeWall() {
  return (
    <section className="cw-badges" aria-label="Awards and credentials">
      <BadgeRow />
    </section>
  )
}

// Interior pages repeat the credentials below the banner at a smaller size.
export function BadgeStrip() {
  return (
    <section className="cw-badges cw-badges-interior" aria-label="Awards and credentials">
      <BadgeRow />
    </section>
  )
}
