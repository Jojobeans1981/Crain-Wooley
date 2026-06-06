import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { TEAM_BY_OFFICE, type TeamMember } from '@/lib/legacy/team'

/**
 * Meet the Team — real route that shadows the legacy catch-all for
 * /staff-profiles (which only captured text). Rebuilds the source page
 * (estateplanningdfw.law/staff-profiles) with the actual headshots, names,
 * titles, and office grouping. Roster lives in lib/legacy/team.ts so the bio
 * pages (LegacyArticle) reuse the same photos. Each card links to its captured
 * legacy bio (Matthew White has none, so his card isn't a link).
 */

const SLATE = '#304451'
const INK = '#1a2230'
const BODY = '#3c4751'
const GOLD_TEXT = '#7A6444' // accessible gold for small text on light (≥4.5:1)
const BG = '#F7F7F7'
const LINE = 'rgba(48,68,81,0.14)'

export const metadata: Metadata = {
  title: 'The Crain & Wooley Team | Crain & Wooley',
  description:
    'Meet the Crain & Wooley team — the attorneys and staff serving estate planning, trust, and probate clients across the Dallas–Fort Worth area.',
}

function Card({ m }: { m: TeamMember }) {
  const inner = (
    <>
      <span style={{ position: 'relative', display: 'block', width: '100%', aspectRatio: '1 / 1', background: '#fff', border: `1px solid ${LINE}`, overflow: 'hidden' }}>
        {/* alt="" is intentional — decorative; the name is the adjacent <h3>,
            so an alt would be a redundant SR announcement (image-redundant-alt). */}
        <Image src={m.photo} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 360px" style={{ objectFit: 'cover' }} />
      </span>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, color: INK, margin: '16px 0 4px', lineHeight: 1.2 }}>
        {m.name}
      </h3>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.84rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: GOLD_TEXT, margin: 0, lineHeight: 1.45 }}>
        {m.title}
      </p>
    </>
  )

  return (
    <li style={{ listStyle: 'none' }}>
      {m.bio ? (
        <Link href={`/staff-profiles/${m.slug}/`} className="cw-team-card" style={{ display: 'block', textDecoration: 'none' }}>
          {inner}
        </Link>
      ) : (
        <div className="cw-team-card">{inner}</div>
      )}
    </li>
  )
}

function OfficeSection({ office, members }: { office: string; members: TeamMember[] }) {
  return (
    <section style={{ paddingBottom: '24px' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 2.6vw, 2.1rem)', fontWeight: 600, color: SLATE, margin: '0 0 28px' }}>
        {office}
      </h2>
      <ul className="cw-team-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px 28px', margin: 0, padding: 0 }}>
        {members.map((m) => <Card key={m.slug} m={m} />)}
      </ul>
    </section>
  )
}

export default function StaffProfilesPage() {
  return (
    <div style={{ background: BG, color: BODY }}>
      <section style={{ borderBottom: `1px solid ${LINE}` }}>
        <div className="cw-container" style={{ paddingTop: '72px', paddingBottom: '48px', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem, 4.4vw, 3.4rem)', fontWeight: 600, color: SLATE, margin: '0 0 14px', lineHeight: 1.12 }}>
            Meet the Crain &amp; Wooley Team
          </h1>
          <p className="cw-eyebrow" style={{ margin: 0, color: GOLD_TEXT, fontSize: '0.82rem' }}>
            Transparency, Integrity &amp; Compassion in All Things
          </p>
        </div>
      </section>

      <div className="cw-container" style={{ paddingTop: '56px', paddingBottom: '72px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {TEAM_BY_OFFICE.map((g) => <OfficeSection key={g.office} office={g.office} members={g.members} />)}
      </div>

      <style>{`
        .cw-team-card { transition: transform .15s ease; }
        a.cw-team-card:hover h3 { color: ${GOLD_TEXT}; }
        a.cw-team-card:focus-visible { outline: 2px solid ${GOLD_TEXT}; outline-offset: 4px; }
        @media (max-width: 980px) { .cw-team-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 560px) { .cw-team-grid { grid-template-columns: 1fr !important; } }
        @media (prefers-reduced-motion: reduce) { .cw-team-card { transition: none; } }
      `}</style>
    </div>
  )
}
