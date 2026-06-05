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

const CREAM = '#faf5ea'
const CREAM_DEEP = '#ede5d3'
const IVORY = '#f6f1e7'
const NAVY = '#2E414F'
const GOLD = '#9A825E'
const GOLD_DARK = '#7A6444'
const GOLD_LIGHT = '#D5C0A2'
const INK = '#1a2230'
const INK_SOFT = '#6b6356'
const INK_MUTE = '#6b6356'
const LINE = 'rgba(26,34,48,0.14)'

export default function IntakeLanding() {
  return (
    <div style={{ fontFamily: 'var(--font-sans)', color: INK, position: 'relative' }}>
      {/* ── UTILITY BAR (3 office phones — matches live site's top phone strip) ── */}
      <div
        style={{
          background: NAVY,
          color: '#fff',
          fontSize: '0.78rem',
          letterSpacing: '0.01em',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '9px 36px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '14px',
          }}
          className="cw-utility-inner"
        >
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: GOLD_LIGHT,
            }}
          >
            Call Us Today
          </span>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '22px',
              alignItems: 'center',
            }}
          >
            {[
              { city: 'Plano',      phone: '(972) 945-1610', tel: '9729451610' },
              { city: 'Mansfield',  phone: '(682) 356-4820', tel: '6823564820' },
              { city: 'Fort Worth', phone: '(817) 672-9442', tel: '8176729442' },
            ].map((loc) => (
              <a
                key={loc.city}
                href={`tel:${loc.tel}`}
                style={{
                  color: '#fff',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span style={{ color: GOLD_LIGHT, fontWeight: 600 }}>{loc.city}:</span>
                <span>{loc.phone}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── PROMO STRIP (webinar / first-time client message) ── */}
      <div
        style={{
          background: CREAM_DEEP,
          color: NAVY,
          padding: '9px 24px',
          textAlign: 'center',
          fontSize: '0.82rem',
          borderBottom: `1px solid ${LINE}`,
        }}
      >
        Now accepting new clients across Dallas-Fort Worth ·{' '}
        <Link
          href="/qualify"
          style={{
            color: GOLD_DARK,
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
          background: 'rgba(250,245,234,0.97)',
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
            aria-label="Crain & Wooley — Home"
          >
            <span role="img" aria-label="Crain & Wooley" className="cw-emblem" />
          </Link>

          {/* Nav links — desktop */}
          <div
            style={{ display: 'flex', gap: '32px', alignItems: 'center' }}
            className="nav-links-desktop"
          >
            {[
              { label: 'About', href: '#about' },
              { label: 'Estate Planning', href: '#services' },
              { label: 'Probate', href: '#services' },
              { label: 'Business Law', href: '#services' },
              { label: 'FAQ', href: '#faq' },
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
            <Link href="/qualify" className="cw-btn-primary !py-2.5 !px-5 !text-sm">
              Book Consultation
            </Link>
          </div>
        </div>
      </nav>

      <main>
      {/* ── HERO ── */}
      <section
        className="cw-hero-anim"
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
            maxWidth: '960px',
            margin: '0 auto',
            padding: '88px 36px 96px',
            textAlign: 'center',
          }}
        >
          <p
            className="cw-hero-eyebrow"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.78rem',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: GOLD_DARK,
              marginBottom: '22px',
            }}
          >
            Dallas-Fort Worth · Estate Planning Attorneys
          </p>

          <h1
            className="cw-hero-title"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.2rem, 4.4vw, 3.7rem)',
              fontWeight: 600,
              lineHeight: 1.12,
              color: NAVY,
              marginBottom: '28px',
              letterSpacing: '-0.005em',
            }}
          >
            Life Can Be Full of Surprises.
            <br />
            The Cost of Planning for Your Future{' '}
            <span style={{ color: GOLD, fontStyle: 'italic', fontWeight: 500 }}>
              Shouldn&apos;t Be One of Them.
            </span>
          </h1>

          <p
            className="cw-hero-sub"
            style={{
              fontSize: '1.1rem',
              lineHeight: 1.7,
              color: INK_SOFT,
              maxWidth: '720px',
              margin: '0 auto 40px',
            }}
          >
            Crain &amp; Wooley offers comprehensive, flat-rate services that serve clients of
            all backgrounds throughout their lifetime. No matter where you are in life, we
            make estate planning simple to better prepare you and your family for the future.
          </p>

          <div
            className="cw-hero-ctas"
            style={{
              display: 'flex',
              gap: '14px',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Link href="/qualify" className="cw-btn-primary">
              Book a Consultation
            </Link>

            <a
              href="tel:9729451610"
              className="cw-btn-ghost inline-flex items-center gap-2"
            >
              <span>☎</span> Call (972) 945-1610
            </a>
          </div>
        </div>
      </section>


      {/* ── ABOUT / INTRO ── */}
      <section id="about" className="reveal" style={{ background: CREAM }}>
        <div
          style={{
            maxWidth: '1040px',
            margin: '0 auto',
            padding: '88px 36px',
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
      <section id="services" className="reveal" style={{ background: IVORY, borderTop: `1px solid ${LINE}` }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '88px 36px' }}>
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
            className="cw-services-grid reveal-stagger"
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
                  transition: 'border-color 0.25s, box-shadow 0.25s',
                  boxShadow: '0 1px 3px rgba(46,65,79,0.04)',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(46,65,79,0.06)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(46,65,79,0.04)'
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

      {/* ── WHAT TO EXPECT ── */}
      <section id="process" className="reveal" style={{ background: CREAM, borderTop: `1px solid ${LINE}` }}>
        <div style={{ maxWidth: '820px', margin: '0 auto', padding: '88px 36px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <p className="cw-eyebrow" style={{ marginBottom: '16px' }}>
              What to Expect
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
              The Estate Planning Process
            </h2>
            <div
              aria-hidden="true"
              style={{ width: '60px', height: '2px', background: GOLD, margin: '0 auto' }}
            />
          </div>

          <p style={{ fontSize: '1.05rem', lineHeight: 1.85, color: INK_SOFT, marginBottom: '20px' }}>
            When you begin working on an estate plan with Crain &amp; Wooley, expect a detailed
            review of your assets, your family situation, and your long-term wishes. We start
            with a confidential consultation \u2014 in person at one of our offices or virtually \u2014
            so we can understand what matters most before we put pen to paper.
          </p>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.85, color: INK_SOFT, marginBottom: '20px' }}>
            From there, we outline the options available under Texas law \u2014 wills, trusts,
            powers of attorney, healthcare directives \u2014 and explain how Dallas, Tarrant, and
            Collin County probate courts may affect your plan. You leave the meeting with a
            clear recommendation and a flat-rate quote. No hourly meter. No surprises.
          </p>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.85, color: INK_SOFT, margin: 0 }}>
            Once you decide to proceed, we draft your documents, walk you through every
            provision in plain language, and execute everything properly so it holds up when
            your family needs it most.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="reveal" style={{ background: IVORY, borderTop: `1px solid ${LINE}` }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '88px 36px' }}>
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
            padding: '88px 36px',
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
            className="cw-services-grid reveal-stagger"
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
                  transition: 'box-shadow 0.25s',
                  boxShadow: '0 1px 3px rgba(46,65,79,0.04)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(46,65,79,0.06)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(46,65,79,0.04)'
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
                <Link href="/qualify" className="cw-btn-primary !text-sm !py-2.5 !px-5">
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

      {/* ── CTA BAND (final call before footer) ── */}
      <section
        className="reveal"
        style={{
          background: NAVY,
          borderTop: `3px solid ${GOLD}`,
          color: '#fff',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '40px 36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '32px',
            flexWrap: 'wrap',
          }}
          className="cw-ctaband-inner"
        >
          <div style={{ minWidth: '280px', flex: '1 1 auto' }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.5rem, 2.4vw, 2rem)',
                fontWeight: 600,
                color: '#fff',
                lineHeight: 1.2,
                marginBottom: '8px',
              }}
            >
              Ready to start your estate plan?
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.98rem',
                color: 'rgba(255,255,255,0.78)',
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              Plain-language guidance, flat-rate pricing, and three Dallas-Fort Worth offices.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href="/qualify" className="cw-btn-primary">
              Book a Consultation
            </Link>
            <a
              href="tel:9729451610"
              style={{
                color: '#fff',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.95rem',
                fontWeight: 600,
                textDecoration: 'none',
                padding: '0.85rem 1.4rem',
                border: '1px solid rgba(255,255,255,0.35)',
                borderRadius: '999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background 200ms, border-color 200ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'
              }}
            >
              <span style={{ color: GOLD_LIGHT }}>☎</span> (972) 945-1610
            </a>
          </div>
        </div>
      </section>
      </main>

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
          .cw-services-grid {
            grid-template-columns: repeat(2, 1fr) !important;
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
