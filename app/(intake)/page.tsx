'use client'
import Link from 'next/link'

// NOTE: Logic, routes, and CTA destinations are unchanged from the prior build.
// This file only restyles the landing page to match estateplanningdfw.law.

const practiceAreas = [
  {
    label: 'Estate Planning',
    desc: 'Wills, trusts, and powers of attorney — built to protect your family, your assets, and your wishes when it matters most.',
  },
  {
    label: 'Probate',
    desc: 'Independent administration, muniment of title, and full probate — guiding executors and heirs through Texas probate court.',
  },
  {
    label: 'Business Law',
    desc: 'Entity formation, operating agreements, contracts, and transactions — practical counsel for closely held businesses and professionals.',
  },
]

const CREAM = '#F7F2E9'
const CREAM_DEEP = '#EFE7D6'
const IVORY = '#FBF8F2'
const NAVY = '#0B1D35'
const GOLD = '#9B8059'
const GOLD_DARK = '#7A6342'
const GOLD_LIGHT = '#B89E78'
const INK = '#1A1A1A'
const INK_SOFT = '#4A4A4A'
const INK_MUTE = '#7A7A7A'
const LINE = '#E2D9C6'

export default function IntakeLanding() {
  return (
    <div style={{ fontFamily: 'var(--font-sans)', color: INK, position: 'relative' }}>
      {/* ── ANNOUNCEMENT BAR (matches client site's top webinar strip) ── */}
      <div
        style={{
          background: NAVY,
          color: '#fff',
          padding: '10px 24px',
          textAlign: 'center',
          fontSize: '0.82rem',
          letterSpacing: '0.01em',
          borderBottom: `1px solid ${GOLD}`,
        }}
      >
        <span style={{ color: GOLD_LIGHT, fontWeight: 600 }}>★</span>{' '}
        Now accepting new clients across Dallas-Fort Worth ·{' '}
        <Link
          href="/qualify"
          style={{
            color: GOLD_LIGHT,
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
            fontWeight: 600,
          }}
        >
          Start your free case review
        </Link>
      </div>

      {/* ── NAV ── */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(247,242,233,0.97)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${LINE}`,
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 36px',
            gap: '24px',
          }}
          className="cw-nav-inner"
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.55rem',
                fontWeight: 600,
                color: NAVY,
                letterSpacing: '0.01em',
                lineHeight: 1,
              }}
            >
              Crain <span style={{ color: GOLD }}>&amp;</span> Wooley
            </span>
          </Link>

          {/* Nav links — desktop */}
          <div
            style={{ display: 'flex', gap: '32px', alignItems: 'center' }}
            className="nav-links-desktop"
          >
            {[
              { label: 'About', href: '#about' },
              { label: 'Services', href: '#services' },
              { label: 'Process', href: '#process' },
              { label: 'Results', href: '#results' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: NAVY,
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = GOLD_DARK)}
                onMouseLeave={(e) => (e.currentTarget.style.color = NAVY)}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right cluster: phone + CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <a
              href="tel:9729451610"
              className="cw-nav-phone"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: NAVY,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ color: GOLD }}>☎</span>
              (972) 945-1610
            </a>
            <Link
              href="/qualify"
              style={{
                background: GOLD,
                color: '#fff',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.82rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                padding: '11px 22px',
                textDecoration: 'none',
                borderRadius: '4px',
                transition: 'background 0.2s, transform 0.15s, box-shadow 0.2s',
                boxShadow: '0 1px 2px rgba(11,29,53,0.2)',
                display: 'inline-block',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = GOLD_DARK
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 4px 10px rgba(122,99,66,0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = GOLD
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(11,29,53,0.2)'
              }}
            >
              Book Consultation
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        style={{
          background: `linear-gradient(180deg, ${CREAM} 0%, ${CREAM_DEEP} 100%)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative gold rule */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${GOLD} 50%, transparent)`,
            opacity: 0.5,
          }}
        />

        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '90px 36px 100px',
            display: 'grid',
            gridTemplateColumns: '1.05fr 0.95fr',
            gap: '72px',
            alignItems: 'center',
          }}
          className="cw-hero-grid"
        >
          {/* LEFT — copy */}
          <div>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: GOLD_DARK,
                marginBottom: '18px',
              }}
            >
              Dallas-Fort Worth · Estate Planning Attorneys
            </p>

            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.4rem, 4.6vw, 3.9rem)',
                fontWeight: 600,
                lineHeight: 1.1,
                color: NAVY,
                marginBottom: '24px',
                letterSpacing: '-0.005em',
              }}
            >
              Life Can Be Full of Surprises.
              <br />
              <span style={{ color: NAVY }}>
                The Cost of Planning for Your Future{' '}
              </span>
              <span style={{ color: GOLD, fontStyle: 'italic', fontWeight: 500 }}>
                Shouldn&apos;t Be One of Them.
              </span>
            </h1>

            <p
              style={{
                fontSize: '1.08rem',
                lineHeight: 1.7,
                color: INK_SOFT,
                maxWidth: '560px',
                marginBottom: '36px',
              }}
            >
              Crain &amp; Wooley offers comprehensive, flat-rate services that serve clients of
              all backgrounds throughout their lifetime. No matter where you are in life, we
              make estate planning simple to better prepare you and your family for the future.
            </p>

            <div
              style={{
                display: 'flex',
                gap: '14px',
                flexWrap: 'wrap',
                alignItems: 'center',
                marginBottom: '36px',
              }}
            >
              <Link
                href="/qualify"
                style={{
                  background: GOLD,
                  color: '#fff',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  padding: '15px 32px',
                  textDecoration: 'none',
                  display: 'inline-block',
                  borderRadius: '4px',
                  transition: 'background 0.2s, transform 0.15s, box-shadow 0.2s',
                  boxShadow: '0 2px 4px rgba(11,29,53,0.18)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = GOLD_DARK
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 6px 14px rgba(122,99,66,0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = GOLD
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(11,29,53,0.18)'
                }}
              >
                Book a Consultation
              </Link>

              <a
                href="tel:9729451610"
                style={{
                  background: 'transparent',
                  color: NAVY,
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  padding: '14px 26px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: '4px',
                  border: `1px solid ${NAVY}`,
                  transition: 'background 0.2s, color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = NAVY
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = NAVY
                }}
              >
                <span>☎</span> Call (972) 945-1610
              </a>
            </div>

            {/* Trust micro-row */}
            <div
              style={{
                display: 'flex',
                gap: '28px',
                flexWrap: 'wrap',
                paddingTop: '24px',
                borderTop: `1px solid ${LINE}`,
              }}
            >
              {[
                { num: '20+', label: 'Years Serving DFW' },
                { num: 'Flat', label: 'Rate Pricing' },
                { num: '5★', label: 'Google Reviews' },
              ].map((s) => (
                <div key={s.label}>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.6rem',
                      fontWeight: 600,
                      color: NAVY,
                      lineHeight: 1,
                    }}
                  >
                    {s.num}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.72rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: INK_MUTE,
                      marginTop: '6px',
                      fontWeight: 500,
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — visual card */}
          <div style={{ position: 'relative' }}>
            {/* Faux portrait / building plate — uses the existing scales image but on a warm card */}
            <div
              style={{
                position: 'relative',
                background: NAVY,
                borderRadius: '6px',
                overflow: 'hidden',
                boxShadow:
                  '0 10px 30px rgba(11,29,53,0.18), 0 2px 6px rgba(11,29,53,0.12)',
                aspectRatio: '4 / 5',
                maxWidth: '460px',
                marginLeft: 'auto',
              }}
            >
              {/* Background image */}
              <img
                src="/scales.jpg"
                alt=""
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0.55,
                  filter: 'sepia(0.2) saturate(0.85)',
                }}
              />
              {/* Navy gradient overlay */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    `linear-gradient(180deg, rgba(11,29,53,0.55) 0%, rgba(11,29,53,0.85) 75%, ${NAVY} 100%)`,
                }}
              />

              {/* Content overlay */}
              <div
                style={{
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '36px 32px',
                  color: '#fff',
                }}
              >
                <div>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.72rem',
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      color: GOLD_LIGHT,
                      fontWeight: 600,
                      marginBottom: '14px',
                    }}
                  >
                    Compassionate Counsel
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.7rem',
                      lineHeight: 1.25,
                      fontWeight: 500,
                      fontStyle: 'italic',
                      color: '#fff',
                    }}
                  >
                    &ldquo;Planning for the future means making decisions you can trust.&rdquo;
                  </p>
                </div>

                <div
                  style={{
                    paddingTop: '24px',
                    borderTop: `1px solid rgba(224,178,95,0.35)`,
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.85rem',
                      color: 'rgba(255,255,255,0.85)',
                      lineHeight: 1.55,
                      marginBottom: '12px',
                    }}
                  >
                    Plain-language guidance from Texas-licensed attorneys. In-person and
                    virtual consultations available.
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.72rem',
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: GOLD_LIGHT,
                      fontWeight: 600,
                    }}
                  >
                    Plano · Mansfield · Fort Worth
                  </p>
                </div>
              </div>
            </div>

            {/* Gold offset accent */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                bottom: '-18px',
                right: '-18px',
                width: '120px',
                height: '120px',
                border: `2px solid ${GOLD}`,
                borderRadius: '6px',
                zIndex: -1,
              }}
              className="cw-hero-accent"
            />
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div style={{ background: NAVY, borderBottom: `3px solid ${GOLD}` }}>
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '22px 36px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '40px',
          }}
        >
          {[
            'Texas Bar College',
            'NAELA Member',
            '5★ Google Rated',
            'Martindale Client Champion',
            'Top 3 Estate Planning · Plano',
          ].map((t) => (
            <span
              key={t}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span style={{ color: GOLD_LIGHT }}>✦</span>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── ABOUT / INTRO ── */}
      <section id="about" style={{ background: CREAM }}>
        <div
          style={{
            maxWidth: '1040px',
            margin: '0 auto',
            padding: '96px 36px',
            textAlign: 'center',
          }}
        >
          <p className="cw-eyebrow" style={{ marginBottom: '16px' }}>
            About Our Firm
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 3.6vw, 2.9rem)',
              fontWeight: 600,
              color: NAVY,
              marginBottom: '24px',
              lineHeight: 1.2,
              letterSpacing: '-0.005em',
            }}
          >
            Let Our Compassionate Lawyers
            <br />
            Help Protect Your Legacy
          </h2>

          {/* Gold divider */}
          <div
            aria-hidden="true"
            style={{
              width: '60px',
              height: '2px',
              background: GOLD,
              margin: '0 auto 32px',
            }}
          />

          <p
            style={{
              fontSize: '1.05rem',
              lineHeight: 1.8,
              color: INK_SOFT,
              maxWidth: '760px',
              margin: '0 auto 24px',
            }}
          >
            At Crain &amp; Wooley, planning for the future means making decisions you can trust.
            From major life changes to inevitable losses, it&apos;s essential to have an estate
            plan in place that helps you protect both your loved ones and your assets.
          </p>
          <p
            style={{
              fontSize: '1.05rem',
              lineHeight: 1.8,
              color: INK_SOFT,
              maxWidth: '760px',
              margin: '0 auto',
            }}
          >
            Our team provides step-by-step guidance, so you can make informed decisions about
            your estate plan across the Dallas-Fort Worth area. We draw on years of experience
            serving clients under Texas estate and probate laws, taking a straightforward
            approach so you clearly understand every part of the process.
          </p>
        </div>
      </section>

      {/* ── SERVICES / PRACTICE AREAS ── */}
      <section id="services" style={{ background: IVORY, borderTop: `1px solid ${LINE}` }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '96px 36px' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p className="cw-eyebrow" style={{ marginBottom: '16px' }}>
              What We Can Do For You
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 3.6vw, 2.9rem)',
                fontWeight: 600,
                color: NAVY,
                marginBottom: '20px',
                lineHeight: 1.2,
              }}
            >
              Comprehensive Legal Services
            </h2>
            <div
              aria-hidden="true"
              style={{ width: '60px', height: '2px', background: GOLD, margin: '0 auto' }}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px',
            }}
            className="cw-services-grid"
          >
            {practiceAreas.map((area) => (
              <div
                key={area.label}
                style={{
                  background: '#fff',
                  border: `1px solid ${LINE}`,
                  borderTop: `3px solid ${GOLD}`,
                  borderRadius: '6px',
                  padding: '36px 32px',
                  transition:
                    'transform 0.25s, box-shadow 0.25s, border-color 0.25s',
                  boxShadow: '0 1px 3px rgba(11,29,53,0.04)',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow =
                    '0 12px 30px rgba(11,29,53,0.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow =
                    '0 1px 3px rgba(11,29,53,0.04)'
                }}
              >
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.45rem',
                    fontWeight: 600,
                    color: NAVY,
                    marginBottom: '12px',
                  }}
                >
                  {area.label}
                </h3>
                <p
                  style={{
                    fontSize: '0.95rem',
                    lineHeight: 1.7,
                    color: INK_SOFT,
                    margin: 0,
                  }}
                >
                  {area.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS / PROCESS ── */}
      <section id="process" style={{ background: CREAM, borderTop: `1px solid ${LINE}` }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '96px 36px' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p className="cw-eyebrow" style={{ marginBottom: '16px' }}>
              Designed for Your Comfort &amp; Convenience
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 3.6vw, 2.9rem)',
                fontWeight: 600,
                color: NAVY,
                marginBottom: '20px',
                lineHeight: 1.2,
              }}
            >
              Estate Planning With Us Means
            </h2>
            <div
              aria-hidden="true"
              style={{ width: '60px', height: '2px', background: GOLD, margin: '0 auto' }}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '32px',
            }}
            className="cw-process-grid"
          >
            {[
              {
                num: '01',
                title: 'Expert Service',
                desc: 'Laws change all the time. We stay up to date with the latest information so that you\u2019re covered. We\u2019re the experts so you don\u2019t have to be.',
              },
              {
                num: '02',
                title: 'Optional Lifetime Guarantee',
                desc: 'With our optional lifetime guarantee, your will and trust are automatically updated over the years to reflect your current wishes and minimize future confusion.',
              },
              {
                num: '03',
                title: 'Flat-Rate Pricing',
                desc: 'Finally, you won\u2019t need a lawyer to understand your legal fees. We communicate our pricing structure upfront. No surprises. No hidden fees.',
              },
            ].map((step) => (
              <div
                key={step.num}
                style={{
                  background: 'transparent',
                  padding: '8px',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '3.2rem',
                    fontWeight: 500,
                    color: GOLD,
                    lineHeight: 1,
                    marginBottom: '18px',
                    fontStyle: 'italic',
                  }}
                >
                  {step.num}
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.45rem',
                    fontWeight: 600,
                    color: NAVY,
                    marginBottom: '14px',
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.95rem',
                    lineHeight: 1.75,
                    color: INK_SOFT,
                    margin: 0,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ background: IVORY, borderTop: `1px solid ${LINE}` }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '96px 36px' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p className="cw-eyebrow" style={{ marginBottom: '16px' }}>
              Common Questions
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 3.6vw, 2.9rem)',
                fontWeight: 600,
                color: NAVY,
                marginBottom: '20px',
                lineHeight: 1.2,
              }}
            >
              Frequently Asked Questions
            </h2>
            <div
              aria-hidden="true"
              style={{ width: '60px', height: '2px', background: GOLD, margin: '0 auto' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              {
                q: 'What is the difference between a will and a trust in Texas?',
                a: 'A will states how your assets pass after your death and usually goes through probate in your home county, such as Tarrant or Dallas. A trust creates a private arrangement that can help your heirs avoid probate court, enable a faster transfer of assets, and give you more control over how property gets distributed.',
              },
              {
                q: 'How often should I update my estate plan?',
                a: 'We recommend reviewing your estate plan every three to five years, or sooner if you experience a major life event — marriage, divorce, the birth of a child, a significant change in assets, or a move to or from Texas.',
              },
              {
                q: 'Do I need an estate plan if I do not own much property?',
                a: 'Yes. An estate plan also designates guardians for minor children, names healthcare and financial agents, and controls how even modest assets pass to the people you love — all without leaving those decisions to a Texas court.',
              },
              {
                q: 'What happens if I die without a will in Texas?',
                a: 'Texas intestacy law decides who inherits your assets, and the rules may not match your wishes. Without a will, the process often takes longer, costs more, and removes your ability to choose guardians for minor children or to provide for unmarried partners or stepchildren.',
              },
              {
                q: 'What is a medical power of attorney?',
                a: 'A medical power of attorney lets you name a trusted person to make healthcare decisions for you if you cannot speak for yourself. It is a core part of every estate plan we build, alongside a will or trust and a durable financial power of attorney.',
              },
            ].map((item, idx) => (
              <details
                key={idx}
                style={{
                  borderTop: idx === 0 ? `1px solid ${LINE}` : 'none',
                  borderBottom: `1px solid ${LINE}`,
                  padding: '24px 0',
                }}
              >
                <summary
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.2rem',
                    fontWeight: 600,
                    color: NAVY,
                    cursor: 'pointer',
                    listStyle: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  <span>{item.q}</span>
                  <span
                    aria-hidden="true"
                    style={{
                      color: GOLD,
                      fontFamily: 'var(--font-sans)',
                      fontSize: '1.5rem',
                      fontWeight: 400,
                      lineHeight: 1,
                      flexShrink: 0,
                    }}
                  >
                    +
                  </span>
                </summary>
                <p
                  style={{
                    fontSize: '1rem',
                    lineHeight: 1.7,
                    color: INK_SOFT,
                    marginTop: '16px',
                    marginBottom: 0,
                    paddingRight: '40px',
                  }}
                >
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOCATIONS / FINAL CTA ── */}
      <section
        style={{
          background: `linear-gradient(180deg, ${CREAM_DEEP} 0%, ${CREAM} 100%)`,
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '96px 36px',
            textAlign: 'center',
          }}
        >
          <p className="cw-eyebrow" style={{ marginBottom: '16px' }}>
            Schedule a Consultation Today
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.1rem, 4vw, 3.2rem)',
              fontWeight: 600,
              color: NAVY,
              marginBottom: '16px',
              lineHeight: 1.2,
            }}
          >
            Start By Selecting a Convenient Location
          </h2>
          <div
            aria-hidden="true"
            style={{ width: '60px', height: '2px', background: GOLD, margin: '0 auto 48px' }}
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px',
              marginBottom: '40px',
            }}
            className="cw-services-grid"
          >
            {[
              {
                city: 'Plano',
                label: 'Principal Location',
                address: '2805 Dallas Parkway, Suite 400',
                cityLine: 'Plano, TX 75093',
                phone: '(972) 945-1610',
                tel: '9729451610',
              },
              {
                city: 'Mansfield',
                label: 'Mansfield Office',
                address: '1671 E Broad St, Suite 102',
                cityLine: 'Mansfield, TX 76063',
                phone: '(682) 356-4820',
                tel: '6823564820',
              },
              {
                city: 'Fort Worth',
                label: 'Fort Worth Office',
                address: '420 Throckmorton St, Suite 200',
                cityLine: 'Fort Worth, TX 76102',
                phone: '(817) 672-9442',
                tel: '8176729442',
              },
            ].map((loc) => (
              <div
                key={loc.city}
                style={{
                  background: '#fff',
                  border: `1px solid ${LINE}`,
                  borderTop: `3px solid ${GOLD}`,
                  borderRadius: '6px',
                  padding: '36px 28px',
                  textAlign: 'left',
                  transition: 'transform 0.25s, box-shadow 0.25s',
                  boxShadow: '0 1px 3px rgba(11,29,53,0.04)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(11,29,53,0.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(11,29,53,0.04)'
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.72rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: GOLD_DARK,
                    fontWeight: 600,
                    marginBottom: '8px',
                  }}
                >
                  {loc.label}
                </p>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.6rem',
                    fontWeight: 600,
                    color: NAVY,
                    marginBottom: '14px',
                    lineHeight: 1.1,
                  }}
                >
                  {loc.city}
                </h3>
                <p
                  style={{
                    fontSize: '0.92rem',
                    color: INK_SOFT,
                    lineHeight: 1.6,
                    marginBottom: '6px',
                  }}
                >
                  {loc.address}
                </p>
                <p
                  style={{
                    fontSize: '0.92rem',
                    color: INK_SOFT,
                    lineHeight: 1.6,
                    marginBottom: '20px',
                  }}
                >
                  {loc.cityLine}
                </p>
                <a
                  href={`tel:${loc.tel}`}
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: NAVY,
                    textDecoration: 'none',
                    marginBottom: '20px',
                  }}
                >
                  {loc.phone}
                </a>
                <Link
                  href="/qualify"
                  style={{
                    display: 'inline-block',
                    background: GOLD,
                    color: '#fff',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    padding: '12px 22px',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = GOLD_DARK)
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.background = GOLD)}
                >
                  Contact Us
                </Link>
              </div>
            ))}
          </div>

          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.82rem',
              color: INK_MUTE,
              letterSpacing: '0.02em',
            }}
          >
            Licensed Texas attorneys · Flat-rate planning services · Plano · Mansfield · Fort
            Worth
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: NAVY, color: '#fff' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '72px 36px 28px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
              gap: '48px',
              marginBottom: '56px',
            }}
            className="cw-footer-grid"
          >
            <div>
              <img
                src="/cw-logo.png"
                alt="Crain & Wooley"
                style={{
                  height: '64px',
                  width: 'auto',
                  marginBottom: '20px',
                  display: 'block',
                }}
              />
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: '#fff',
                  marginBottom: '16px',
                  letterSpacing: '0.01em',
                }}
              >
                Crain <span style={{ color: GOLD_LIGHT }}>&amp;</span> Wooley
              </div>
              <p
                style={{
                  fontSize: '0.92rem',
                  color: 'rgba(255,255,255,0.7)',
                  lineHeight: 1.7,
                  maxWidth: '320px',
                  marginBottom: '20px',
                }}
              >
                Estate planning, probate, and elder law for families across the
                Dallas-Fort Worth area. Plain-language guidance and flat-rate pricing.
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.75rem',
                  color: GOLD_LIGHT,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                Plano · Mansfield · Fort Worth
              </p>
            </div>

            <div>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.78rem',
                  color: GOLD_LIGHT,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  marginBottom: '20px',
                  fontWeight: 600,
                }}
              >
                Practice Areas
              </p>
              {practiceAreas.map((a) => (
                <p
                  key={a.label}
                  style={{
                    fontSize: '0.9rem',
                    color: 'rgba(255,255,255,0.7)',
                    marginBottom: '10px',
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = GOLD_LIGHT)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')
                  }
                >
                  {a.label}
                </p>
              ))}
            </div>

            <div>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.78rem',
                  color: GOLD_LIGHT,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  marginBottom: '20px',
                  fontWeight: 600,
                }}
              >
                Firm
              </p>
              {['About Us', 'Our Team', 'Pricing', 'Resources', 'Blog', 'Contact Us'].map(
                (item) => (
                  <p
                    key={item}
                    style={{
                      fontSize: '0.9rem',
                      color: 'rgba(255,255,255,0.7)',
                      marginBottom: '10px',
                      cursor: 'pointer',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = GOLD_LIGHT)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')
                    }
                  >
                    {item}
                  </p>
                ),
              )}
            </div>

            <div>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.78rem',
                  color: GOLD_LIGHT,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  marginBottom: '20px',
                  fontWeight: 600,
                }}
              >
                Locations
              </p>
              {[
                { city: 'Plano', addr: '2805 Dallas Pkwy, Ste 400', phone: '(972) 945-1610', tel: '9729451610' },
                { city: 'Mansfield', addr: '1671 E Broad St, Ste 102', phone: '(682) 356-4820', tel: '6823564820' },
                { city: 'Fort Worth', addr: '420 Throckmorton St, Ste 200', phone: '(817) 672-9442', tel: '8176729442' },
              ].map((loc) => (
                <div key={loc.city} style={{ marginBottom: '18px' }}>
                  <p
                    style={{
                      fontSize: '0.9rem',
                      color: '#fff',
                      fontWeight: 600,
                      marginBottom: '2px',
                    }}
                  >
                    {loc.city}
                  </p>
                  <p
                    style={{
                      fontSize: '0.82rem',
                      color: 'rgba(255,255,255,0.6)',
                      marginBottom: '2px',
                      lineHeight: 1.4,
                    }}
                  >
                    {loc.addr}
                  </p>
                  <a
                    href={`tel:${loc.tel}`}
                    style={{
                      fontSize: '0.85rem',
                      color: GOLD_LIGHT,
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}
                  >
                    {loc.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              paddingTop: '28px',
              borderTop: '1px solid rgba(255,255,255,0.12)',
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.78rem',
                color: 'rgba(255,255,255,0.45)',
              }}
            >
              © 2026 Crain &amp; Wooley PLLC. All rights reserved.
            </p>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.78rem',
                color: 'rgba(255,255,255,0.45)',
                maxWidth: '560px',
                textAlign: 'right',
                lineHeight: 1.6,
              }}
            >
              This site is for informational purposes only and does not constitute legal
              advice. Receipt does not create an attorney-client relationship.
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 980px) {
          .nav-links-desktop { display: none !important; }
          .cw-nav-phone { display: none !important; }
          .cw-hero-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
            padding-top: 60px !important;
            padding-bottom: 60px !important;
          }
          .cw-hero-accent { display: none !important; }
          .cw-services-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .cw-process-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .cw-footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 36px !important;
          }
        }
        @media (max-width: 640px) {
          .cw-services-grid {
            grid-template-columns: 1fr !important;
          }
          .cw-footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
