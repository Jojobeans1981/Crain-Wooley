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
      <span style={{ position: 'relative', display: 'block', width: '100%', aspectRatio: '4 / 5', background: '#fff', overflow: 'hidden' }}>
        {/* alt="" is intentional — decorative; the name is in the footer box below. */}
        <Image src={m.photo} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 320px" style={{ objectFit: 'cover', objectPosition: 'top' }} />
      </span>
      {/* Navy footer box: white serif name, gold italic title, gold external arrow. */}
      <span className="cw-team-foot">
        <span className="cw-team-foot-text">
          <span className="cw-team-name">{m.name}</span>
          <span className="cw-team-title">{m.title}</span>
        </span>
        {m.bio && (
          <svg className="cw-team-arrow" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M17 7H9M17 7v8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        )}
      </span>
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
      <ul className="cw-team-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '28px 24px', margin: 0, padding: 0 }}>
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
        .cw-team-card { display: block; }
        .cw-team-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: ${SLATE}; padding: 18px 20px; }
        .cw-team-foot-text { display: block; min-width: 0; }
        .cw-team-name { display: block; font-family: var(--font-display); font-weight: 600; font-size: 1.18rem; line-height: 1.15; color: #fff; }
        .cw-team-title { display: block; font-family: var(--font-display); font-style: italic; font-weight: 400; font-size: 0.92rem; line-height: 1.3; color: var(--cw-gold-soft, #D5C0A2); margin-top: 4px; }
        .cw-team-arrow { flex: none; color: var(--cw-gold-soft, #D5C0A2); transition: transform .15s ease, color .15s ease; }
        a.cw-team-card:hover .cw-team-arrow { transform: translate(2px, -2px); color: #fff; }
        a.cw-team-card:focus-visible { outline: 2px solid ${GOLD_TEXT}; outline-offset: 4px; }
        @media (max-width: 1180px) { .cw-team-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 680px) { .cw-team-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 460px) { .cw-team-grid { grid-template-columns: 1fr !important; } }
        @media (prefers-reduced-motion: reduce) { .cw-team-arrow { transition: none; } }
      `}</style>
    </div>
  )
}
