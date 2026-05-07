'use client'
import Link from 'next/link'

const practiceAreas = [
  { label: 'Estate Planning', desc: 'Wills, trusts, powers of attorney, and healthcare directives crafted to protect your legacy.' },
  { label: 'Family Law', desc: 'Divorce, child custody, support modifications, and adoptions handled with decisive advocacy.' },
  { label: 'Personal Injury', desc: 'Auto accidents, slip and fall, wrongful death — we fight to maximize your recovery.' },
  { label: 'Business Law', desc: 'Entity formation, contracts, disputes, and transactions — practical counsel for your business.' },
  { label: 'Criminal Defense', desc: 'DWI, felonies, misdemeanors, and expunctions — aggressive defense of your freedom and record.' },
  { label: 'Real Estate', desc: 'Purchases, sales, title disputes, and landlord-tenant matters across Texas.' },
]

export default function IntakeLanding() {
  return (
    <div style={{ fontFamily: 'var(--font-sans)', color: '#E8E2D6', position: 'relative' }}>

      {/* scales of justice watermark — centered in full page, scrolls with content */}
      <img
        src="/scales.jpg"
        alt=""
        aria-hidden="true"
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '1100px', height: '1100px',
          objectFit: 'contain',
          opacity: 0.12,
          pointerEvents: 'none',
          mixBlendMode: 'luminosity',
          zIndex: 0,
        }}
      />

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 60px',
        background: 'rgba(11,29,53,0.97)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(201,168,76,0.2)',
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>
          CRAIN <span style={{ color: '#C5933A' }}>&amp;</span> WOOLEY
        </div>

        <div style={{ display: 'flex', gap: '36px' }} className="nav-links-desktop">
          {['Practice Areas', 'How It Works', 'About', 'Results'].map(item => (
            <span key={item} style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
              fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.65)', cursor: 'pointer',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = '#C5933A')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
            >
              {item}
            </span>
          ))}
        </div>

        <Link href="/qualify" style={{
          background: '#C5933A', color: '#0B1D35',
          fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
          fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
          padding: '10px 22px', textDecoration: 'none',
          transition: 'background 0.2s',
          display: 'inline-block',
        }}
          onMouseEnter={e => (e.currentTarget.style.background = '#d9a448')}
          onMouseLeave={e => (e.currentTarget.style.background = '#C5933A')}
        >
          Free Case Review →
        </Link>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: 'calc(100vh - 65px)',
        display: 'flex', alignItems: 'center',
        padding: '80px 60px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* radial glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '55%',
          transform: 'translate(-50%, -50%)',
          width: '700px', height: '700px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(197,147,58,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />


        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '80px', alignItems: 'center',
          maxWidth: '1200px', margin: '0 auto', width: '100%',
          position: 'relative', zIndex: 1,
        }}>

          {/* LEFT */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(197,147,58,0.1)',
              border: '1px solid rgba(197,147,58,0.35)',
              borderRadius: '999px',
              color: '#C5933A',
              fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
              fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase',
              padding: '7px 16px', marginBottom: '32px',
            }}>
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: '#C5933A', display: 'inline-block',
                animation: 'cw-pulse 2s infinite',
              }} />
              Accepting New Clients · Plano, Texas
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.8rem, 5vw, 4.2rem)',
              fontWeight: 900, lineHeight: 1.1,
              color: '#fff', marginBottom: '24px',
            }}>
              Legal Help.
              <br />
              <span style={{ color: '#C5933A' }}>Without the</span>
              <br />
              Runaround.
            </h1>

            <p style={{
              fontSize: '1rem', lineHeight: 1.75,
              color: 'rgba(255,255,255,0.65)',
              maxWidth: '420px', marginBottom: '40px',
            }}>
              Tell us about your situation — we&apos;ll tell you if we can help, in minutes not days. No voicemail. No waiting for a callback. No obligation until you pay.
            </p>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <Link href="/qualify" style={{
                background: '#C5933A', color: '#0B1D35',
                fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
                fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '15px 34px', textDecoration: 'none', display: 'inline-block',
                transition: 'background 0.2s, transform 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#d9a448'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#C5933A'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                See If We Can Help →
              </Link>

              <button style={{
                background: 'transparent', color: 'rgba(255,255,255,0.75)',
                fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
                fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
                padding: '15px 28px',
                border: '1px solid rgba(255,255,255,0.25)',
                cursor: 'pointer', transition: 'border-color 0.2s, color 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#C5933A'; e.currentTarget.style.color = '#C5933A' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)' }}
              >
                Call Us Now
              </button>
            </div>

            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
              color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em',
            }}>
              Takes about 3 minutes &nbsp;·&nbsp; Texas State Bar Licensed &nbsp;·&nbsp; Client Privacy Guaranteed
            </p>
          </div>

          {/* RIGHT — card */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(197,147,58,0.25)',
            borderRadius: '12px',
            padding: '44px 40px',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.4rem', fontWeight: 700,
              color: '#fff', marginBottom: '8px',
            }}>
              What We Handle
            </h3>
            <p style={{
              fontSize: '0.83rem', color: 'rgba(255,255,255,0.45)',
              marginBottom: '28px',
            }}>
              Texas-licensed attorneys across six practice areas
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '36px' }}>
              {practiceAreas.map(area => (
                <span key={area.label} style={{
                  border: '1px solid rgba(197,147,58,0.4)',
                  borderRadius: '999px',
                  color: '#C5933A',
                  fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                  fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                  padding: '7px 14px', cursor: 'default',
                  transition: 'background 0.2s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(197,147,58,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {area.label}
                </span>
              ))}
            </div>

            <div style={{ paddingTop: '28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', textAlign: 'center' }}>
                {[
                  { num: '20+', label: 'Years Experience' },
                  { num: '98%', label: 'Client Satisfaction' },
                  { num: '$300', label: 'Consultation Fee' },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: '#C5933A' }}>{s.num}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div style={{ background: '#C5933A' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '18px 60px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '48px' }}>
            {[
              '✦ State Bar of Texas Licensed',
              '✦ No Voicemail — Real Attorneys',
              '✦ Yes or No in Minutes',
              '✦ Zero Obligation Until You Pay',
            ].map(t => (
              <span key={t} style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: '#0B1D35',
              }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '90px 60px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#C5933A', letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block', marginBottom: '14px' }}>
            Simple Process
          </span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 700, color: '#fff', marginBottom: '56px' }}>
            Three Steps to Knowing<br />Where You Stand
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { num: '01', title: 'Answer a Few Questions', desc: 'Tell us your practice area, what happened, and how urgent it is. Takes about 3 minutes from any device.' },
              { num: '02', title: 'We Review Instantly', desc: 'Our system checks if your matter fits. You get a yes or no right away — no waiting, no runaround.' },
              { num: '03', title: 'Book Your Consultation', desc: 'If we can help, pay the $300 fee and lock in a time on our calendar. Confirmed immediately.' },
            ].map((step) => (
              <div key={step.num} style={{
                padding: '44px 36px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '12px',
                position: 'relative', cursor: 'default',
                transition: 'background 0.2s, border-color 0.2s',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  e.currentTarget.style.borderColor = 'rgba(197,147,58,0.3)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                }}
              >
                <div style={{ display: 'none' }} />
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', fontWeight: 900, color: 'rgba(197,147,58,0.15)', lineHeight: 1, marginBottom: '20px' }}>{step.num}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>{step.title}</h3>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.5)' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRACTICE AREAS ── */}
      <section>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '90px 60px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#C5933A', letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block', marginBottom: '14px' }}>
            Areas of Law
          </span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 700, color: '#fff', marginBottom: '56px' }}>
            Comprehensive Representation<br />Across Texas
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {practiceAreas.map((area) => (
              <div key={area.label} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '12px',
                padding: '40px 32px',
                position: 'relative', cursor: 'default',
                overflow: 'hidden',
                transition: 'background 0.2s, border-color 0.2s',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  e.currentTarget.style.borderColor = 'rgba(197,147,58,0.3)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                }}
              >
                <div style={{ display: 'none' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>{area.label}</h3>
                <p style={{ fontSize: '0.83rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.45)' }}>{area.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '90px 40px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 900, color: '#fff', marginBottom: '18px', lineHeight: 1.2 }}>
            Find Out in Minutes if<br /><span style={{ color: '#C5933A' }}>We&apos;re the Right Fit.</span>
          </h2>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.55)', marginBottom: '36px', lineHeight: 1.75 }}>
            Stop searching. Stop waiting for callbacks. Our intake is designed so you know exactly where you stand — fast, and without the pressure.
          </p>
          <Link href="/qualify" style={{
            background: '#C5933A', color: '#0B1D35',
            fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
            fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            padding: '16px 36px', textDecoration: 'none', display: 'inline-block',
            marginBottom: '16px', transition: 'background 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = '#d9a448')}
            onMouseLeave={e => (e.currentTarget.style.background = '#C5933A')}
          >
            Start Your Free Case Review →
          </Link>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>
            $300 consultation fee · Applies only if we can help · Licensed Texas attorneys
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: 'rgba(0,0,0,0.3)', padding: '60px 60px 36px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '60px', marginBottom: '48px' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '14px' }}>
                CRAIN <span style={{ color: '#C5933A' }}>&amp;</span> WOOLEY
              </div>
              <p style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, maxWidth: '260px', marginBottom: '16px' }}>
                Licensed Texas attorneys offering straightforward legal guidance — without the runaround.
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Plano, Texas · Accepting New Clients
              </p>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#C5933A', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '18px' }}>Practice Areas</p>
              {practiceAreas.map(a => (
                <p key={a.label} style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.45)', marginBottom: '10px', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#C5933A')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
                >{a.label}</p>
              ))}
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#C5933A', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '18px' }}>Firm</p>
              {['How It Works', 'About the Firm', 'Start Case Review', 'Client Portal', 'Privacy Policy'].map(item => (
                <p key={item} style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.45)', marginBottom: '10px', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#C5933A')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
                >{item}</p>
              ))}
            </div>
          </div>

          <div style={{ paddingTop: '28px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em' }}>
              © 2026 Crain &amp; Wooley PLLC. All rights reserved.
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', maxWidth: '500px', textAlign: 'right', lineHeight: 1.6 }}>
              This site is for informational purposes only and does not constitute legal advice.
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes cw-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.5); }
        }
        @media (max-width: 900px) {
          .nav-links-desktop { display: none !important; }
        }
        @media (max-width: 768px) {
          section[style] { padding-left: 24px !important; padding-right: 24px !important; }
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; gap: 40px !important; }
          div[style*="grid-template-columns: repeat(3, 1fr)"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: 2fr 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>

    </div>
  )
}
