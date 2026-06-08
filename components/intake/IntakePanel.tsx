import { cf, PAPER_GRAIN_URL } from '@/lib/cf'
import { PrivacyShield } from './PrivacyShield'

/**
 * The sticky dark editorial panel on the left of every intake screen.
 * Ported verbatim (markup + inline styles) from the approved intake design
 * (option-counsel-final.jsx · the <aside> of CounselFinalIntake). The desktop
 * middle/footer blocks collapse on mobile via `hidden md:flex`, matching the
 * source's isMobile behavior with CSS instead of a JS media query.
 */
const OFFICES: Array<[string, string]> = [
  ['Plano', '(972) 945-1610'],
  ['Mansfield', '(682) 356-4820'],
  ['Fort Worth', '(817) 672-9442'],
]

export function IntakePanel() {
  return (
    <aside
      className="cw-intake-panel"
      style={{
        position: 'relative',
        background: cf.ink,
        color: cf.cream,
        display: 'flex',
        flexDirection: 'column',
        backgroundImage: `linear-gradient(180deg, rgba(154,130,94,0.06), transparent 30%), url("${PAPER_GRAIN_URL}")`,
        overflow: 'hidden',
      }}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/hero-bg.jpg"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <source src="/Mainstage-Video-Final-1.mp4" type="video/mp4" />
      </video>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          background:
            'linear-gradient(180deg, rgba(46,65,79,0.82) 0%, rgba(46,65,79,0.78) 50%, rgba(46,65,79,0.88) 100%)',
        }}
      />

      {/* Oversized "cw" watermark (desktop only) */}
      <div
        className="cw-intake-deskonly-block"
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: -30,
          top: -10,
          fontFamily: cf.serif,
          fontSize: 280,
          color: 'rgba(154,130,94,0.08)',
          lineHeight: 1,
          fontStyle: 'italic',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 2,
        }}
      >
        cw
      </div>

      {/* Brand header */}
      <header
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
        }}
      >
        <img src="/cw-logo.png" alt="Crain & Wooley" style={{ height: 84, width: 'auto', display: 'block' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontFamily: cf.serif, fontSize: 30, letterSpacing: '0.01em', lineHeight: 1.05, fontWeight: 700 }}>
            Crain &amp; Wooley
          </span>
          <span
            style={{
              fontFamily: cf.mono,
              fontSize: 11,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(246,241,231,0.6)',
            }}
          >
            Estate · Trust · Probate
          </span>
        </div>
      </header>

      {/* Editorial middle (desktop only) */}
      <div
        className="cw-intake-deskonly"
        style={{ position: 'relative', zIndex: 2, flexDirection: 'column', gap: 24 }}
      >
        <span style={{ fontFamily: cf.mono, fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: cf.brassLight }}>
          New Client Intake
        </span>
        <h2 style={{ fontFamily: cf.serif, fontSize: 52, margin: 0, lineHeight: 1.02, fontWeight: 400, letterSpacing: '-0.01em' }}>
          A thoughtful plan, <em style={{ fontStyle: 'italic', color: cf.brassLight }}>shaped to you.</em>
        </h2>
        <p
          style={{
            fontFamily: cf.sans,
            fontSize: 14.5,
            lineHeight: 1.7,
            color: 'rgba(246,241,231,0.78)',
            margin: 0,
            maxWidth: 360,
          }}
        >
          A short, confidential intake. About six minutes. Used solely to prepare for your
          consultation — never shared outside the firm.
        </p>
        <div style={{ height: 1, background: 'rgba(246,241,231,0.18)', width: 64, margin: '8px 0' }} />
        <blockquote
          style={{
            fontFamily: cf.serif,
            fontStyle: 'italic',
            fontSize: 18,
            lineHeight: 1.5,
            color: 'rgba(246,241,231,0.86)',
            margin: 0,
            maxWidth: 340,
          }}
        >
          “It was simple, and it took a load off our minds and hearts as well.”
        </blockquote>
        <span style={{ fontFamily: cf.sans, fontSize: 12, color: 'rgba(246,241,231,0.55)', letterSpacing: '0.04em' }}>
          Bobby and Kathie Hamm · Crain &amp; Wooley clients
        </span>
      </div>

      {/* Office footer (desktop only) */}
      <footer
        className="cw-intake-deskonly"
        style={{ position: 'relative', zIndex: 2, flexDirection: 'column', gap: 14 }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {OFFICES.map(([city, num]) => (
            <div key={city} style={{ borderTop: `1px solid rgba(246,241,231,0.18)`, paddingTop: 10 }}>
              <div style={{ fontFamily: cf.serif, fontSize: 14, color: cf.cream, fontWeight: 700 }}>{city}</div>
              <div style={{ fontFamily: cf.sans, fontSize: 10.5, color: 'rgba(246,241,231,0.55)', marginTop: 2, letterSpacing: '0.02em' }}>
                {num}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: cf.sans, fontSize: 11.5, color: 'rgba(246,241,231,0.55)' }}>
          <PrivacyShield color={cf.brass} />
          <span>Encrypted intake. Submitting does not create an attorney-client relationship.</span>
        </div>
      </footer>
    </aside>
  )
}
