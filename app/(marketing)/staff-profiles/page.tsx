import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

/**
 * Meet the Team — real route that shadows the legacy catch-all for
 * /staff-profiles (which only captured text). Rebuilds the source page
 * (estateplanningdfw.law/staff-profiles) with the actual headshots, names,
 * titles, and office grouping, linking each card to its existing legacy bio.
 *
 * Headshots are re-hosted under /public/team. Matthew White and Jacob Wooley
 * have no photo on the source either (1×1 placeholder), so they render an
 * initials tile — matching the source. Matthew White has no captured bio page,
 * so his card is not a link.
 */

const SLATE = '#304451'
const INK = '#1a2230'
const BODY = '#3c4751'
const GOLD = '#9B8059'
const GOLD_TEXT = '#7A6444' // accessible gold for small text on light (≥4.5:1)
const BG = '#F7F7F7'
const LINE = 'rgba(48,68,81,0.14)'

type Member = {
  name: string
  title: string
  slug: string
  photo?: string // /team/*.jpg|png; omit for an initials tile
  bio?: boolean // whether a legacy bio page exists to link to
}

const PLANO: Member[] = [
  { name: 'Justin T. Crain', title: 'Managing Partner & Attorney', slug: 'justin-t-crain', photo: '/team/justin-crain.jpg', bio: true },
  { name: 'Jeremy Crew', title: 'Senior Attorney', slug: 'jeremy-crew', photo: '/team/jeremy-crew.jpg', bio: true },
  { name: 'Joy Crosby', title: 'Chief Operating Officer', slug: 'joy-crosby', photo: '/team/joy-crosby.jpg', bio: true },
  { name: 'Connor Martin', title: 'Attorney', slug: 'connor-martin', photo: '/team/connor-martin.jpg', bio: true },
  { name: 'Kevin Berber', title: 'Director of Marketing and Communications', slug: 'kevin-berber', photo: '/team/kevin-berber.jpg', bio: true },
  { name: 'Marcel Williams', title: 'Paralegal', slug: 'marcel-williams', photo: '/team/marcel-williams.jpg', bio: true },
  { name: 'Mary Hughes', title: 'Paralegal', slug: 'mary-hughes', photo: '/team/mary-hughes.png', bio: true },
  { name: 'Brynn Siciliano', title: 'Marketing and Event Coordinator / Legal Services Coordinator', slug: 'brynn-siciliano', photo: '/team/brynn-siciliano.jpg', bio: true },
  { name: 'Matthew White', title: 'Operations & Legal Assistant', slug: 'matthew-white', bio: false },
]

const MANSFIELD: Member[] = [
  { name: 'Jacob Wooley', title: 'Partner & Attorney', slug: 'jacob-wooley', bio: true },
]

export const metadata: Metadata = {
  title: 'The Crain & Wooley Team | Crain & Wooley',
  description:
    'Meet the Crain & Wooley team — the attorneys and staff serving estate planning, trust, and probate clients across the Dallas–Fort Worth area.',
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function Card({ m }: { m: Member }) {
  const inner = (
    <>
      <span
        style={{
          position: 'relative',
          display: 'block',
          width: '100%',
          aspectRatio: '1 / 1',
          background: m.photo ? '#fff' : SLATE,
          border: `1px solid ${LINE}`,
          overflow: 'hidden',
        }}
      >
        {m.photo ? (
          // alt="" is intentional — decorative; the name is the adjacent <h3>,
          // so an alt would be a redundant SR announcement (axe image-redundant-alt).
          <Image src={m.photo} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 360px" style={{ objectFit: 'cover' }} />
        ) : (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontSize: '3.4rem',
              color: GOLD,
              letterSpacing: '0.02em',
            }}
          >
            {initials(m.name)}
          </span>
        )}
      </span>
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.4rem',
          fontWeight: 600,
          color: INK,
          margin: '16px 0 4px',
          lineHeight: 1.2,
        }}
      >
        {m.name}
      </h3>
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.84rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: GOLD_TEXT,
          margin: 0,
          lineHeight: 1.45,
        }}
      >
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

function OfficeSection({ office, members }: { office: string; members: Member[] }) {
  return (
    <section style={{ paddingBottom: '24px' }}>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.6rem, 2.6vw, 2.1rem)',
          fontWeight: 600,
          color: SLATE,
          margin: '0 0 28px',
        }}
      >
        {office}
      </h2>
      <ul
        className="cw-team-grid"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px 28px', margin: 0, padding: 0 }}
      >
        {members.map((m) => (
          <Card key={m.slug} m={m} />
        ))}
      </ul>
    </section>
  )
}

export default function StaffProfilesPage() {
  return (
    <div style={{ background: BG, color: BODY }}>
      {/* Header */}
      <section style={{ borderBottom: `1px solid ${LINE}` }}>
        <div className="cw-container" style={{ paddingTop: '72px', paddingBottom: '48px', textAlign: 'center' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.2rem, 4.4vw, 3.4rem)',
              fontWeight: 600,
              color: SLATE,
              margin: '0 0 14px',
              lineHeight: 1.12,
            }}
          >
            Meet the Crain &amp; Wooley Team
          </h1>
          <p className="cw-eyebrow" style={{ margin: 0, color: GOLD_TEXT, fontSize: '0.82rem' }}>
            Transparency, Integrity &amp; Compassion in All Things
          </p>
        </div>
      </section>

      {/* Roster */}
      <div className="cw-container" style={{ paddingTop: '56px', paddingBottom: '72px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        <OfficeSection office="Plano Office" members={PLANO} />
        <OfficeSection office="Mansfield Office" members={MANSFIELD} />
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
