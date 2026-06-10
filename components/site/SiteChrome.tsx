'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

/**
 * Shared public-site header + footer — a literal visual clone of the live
 * Scorpion site (estateplanningdfw.law). Used by the marketing (legacy-page)
 * layout and the Learning Center layout.
 *
 * LINK WIRING: every nav item points at its ORIGINAL Scorpion path (trailing
 * slash). Those already resolve 200 through the legacy catch-all — do NOT point
 * them at /learn. Styling uses Stage-1 brand tokens only (slate #304451, gold
 * #9B8059, #F7F7F7); square corners, borders for elevation, no drop shadows.
 */

type NavNode = { label: string; href: string; children?: NavNode[] }

// Exact nav tree from the live <nav> (home.html). Hrefs are the original paths.
const NAV: NavNode[] = [
  { label: 'Home', href: '/' },
  {
    label: 'About Us', href: '/about-us/', children: [
      { label: 'Our Team', href: '/staff-profiles/' },
      { label: 'Service Model', href: '/about-us/service-model/' },
      {
        label: 'Pricing', href: '/about-us/pricing/', children: [
          { label: 'Flat Rate Services', href: '/about-us/pricing/flat-rate-services/' },
          { label: 'Hourly Service', href: '/about-us/pricing/hourly-service/' },
        ],
      },
    ],
  },
  {
    label: 'Estate Planning', href: '/estate-planning/', children: [
      { label: 'Wills', href: '/estate-planning/wills/', children: [
        { label: 'Living Wills', href: '/estate-planning/wills/living-wills/' },
      ] },
      { label: 'Trusts', href: '/estate-planning/trusts/', children: [
        { label: 'Trust Administration', href: '/estate-planning/trusts/trust-administration/' },
        { label: 'Trust Litigation', href: '/estate-planning/trusts/trust-litigation/' },
      ] },
      { label: 'Charitable Trusts', href: '/estate-planning/charitable-trusts/' },
      { label: 'Irrevocable Trusts', href: '/estate-planning/irrevocable-trusts/' },
      { label: 'Supplemental Needs Trust', href: '/estate-planning/supplemental-needs-trust/' },
      { label: 'Revocable Living Trusts', href: '/estate-planning/revocable-living-trusts/' },
      { label: 'Adult Guardianship', href: '/estate-planning/adult-guardianship/' },
      { label: 'Disability Planning', href: '/estate-planning/disability-planning/' },
      { label: 'Asset Protection', href: '/estate-planning/asset-protection/' },
      { label: 'Tax Planning', href: '/estate-planning/tax-planning/' },
      { label: 'Pre & Postnuptial Agreements', href: '/estate-planning/pre-postnuptial-agreements/' },
      { label: 'Power of Attorney', href: '/estate-planning/power-of-attorney/', children: [
        { label: 'Financial Power of Attorney', href: '/estate-planning/power-of-attorney/financial-power-of-attorney/' },
        { label: 'Medical Power of Attorney', href: '/estate-planning/power-of-attorney/medical-power-of-attorney/' },
      ] },
      { label: 'Existing Plan Review Update', href: '/estate-planning/existing-plan-review-update/' },
      { label: 'Adult Medicaid', href: '/estate-planning/adult-medicaid/' },
      { label: 'Long-Term Care Planning', href: '/estate-planning/long-term-care-planning/' },
      { label: 'Retirement Planning', href: '/estate-planning/retirement-planning/' },
      { label: 'Inheritance Law', href: '/estate-planning/inheritance-law/' },
      { label: 'Conservatorship', href: '/estate-planning/conservatorship/' },
    ],
  },
  {
    label: 'Probate', href: '/probate/', children: [
      { label: 'Probate Administration', href: '/probate/probate-administration/' },
      { label: 'Probate Litigation', href: '/probate/probate-litigation/' },
      { label: 'Probate for Out-of-State Executors', href: '/probate/probate-for-out-of-state-executors/' },
    ],
  },
  {
    label: 'Business Law', href: '/business-law/', children: [
      { label: 'Business Succession Planning', href: '/business-law/business-succession-planning/' },
    ],
  },
  {
    label: 'Resources', href: '/resources/', children: [
      { label: 'Attend a Free Seminar', href: '/events/' },
      { label: 'Reviews', href: '/reviews/' },
      { label: 'Blog', href: '/blogs/' },
      { label: 'Educational Videos', href: '/media-center/' },
      { label: 'Free Estate Planning Guide', href: '/resources/free-estate-planning-guide/' },
      { label: 'Probate Quiz & Survey', href: '/resources/probate-quiz-survey/' },
      { label: 'Leaving A Legacy Texas Estate Planning', href: '/resources/leaving-a-legacy-texas-estate-planning/' },
      { label: 'White Papers', href: '/resources/white-papers/', children: [
        { label: "Don't Want To Leave Your Assets A Mess For Your Family?", href: '/resources/white-papers/don-t-want-to-leave-your-assets-a-mess-for-your-/' },
      ] },
    ],
  },
  {
    // Top-level points to /mansfield/, but its Probate child uses the hyphenated
    // /mansfield-fw/probate/ path (matches the live nav exactly).
    label: 'Mansfield / FW', href: '/mansfield/', children: [
      { label: 'Estate Planning', href: '/estate-planning/' },
      { label: 'Wills', href: '/estate-planning/wills/' },
      { label: 'Living Wills', href: '/estate-planning/wills/living-wills/' },
      { label: 'Trusts', href: '/estate-planning/trusts/' },
      { label: 'Charitable Trusts', href: '/estate-planning/charitable-trusts/' },
      { label: 'Irrevocable Trusts', href: '/estate-planning/irrevocable-trusts/' },
      { label: 'Supplemental Needs Trust', href: '/estate-planning/supplemental-needs-trust/' },
      { label: 'Revocable Living Trusts', href: '/estate-planning/revocable-living-trusts/' },
      { label: 'Disability Planning', href: '/estate-planning/disability-planning/' },
      { label: 'Asset Protection', href: '/estate-planning/asset-protection/' },
      { label: 'Tax Planning', href: '/estate-planning/tax-planning/' },
      { label: 'Pre & Postnuptial Agreements', href: '/estate-planning/pre-postnuptial-agreements/' },
      { label: 'Power of Attorney', href: '/estate-planning/power-of-attorney/' },
      { label: 'Existing Plan Review Update', href: '/estate-planning/existing-plan-review-update/' },
      { label: 'Long-Term Care Planning', href: '/estate-planning/long-term-care-planning/' },
      { label: 'Probate', href: '/mansfield-fw/probate/' },
    ],
  },
  { label: 'Site Search', href: '/site-search/' },
]

// Phone strip — display format matches the live site (hyphenated).
const PHONES = [
  { city: 'Plano', display: '972-945-1610', tel: '9729451610' },
  { city: 'Mansfield', display: '682-356-4820', tel: '6823564820' },
  { city: 'Fort Worth', display: '817-672-9442', tel: '8176729442' },
]

// ── Icons ──
function Caret() {
  return (
    <svg className="cw-nav-caret" viewBox="0 0 12 8" fill="none" aria-hidden="true">
      <path d="M1 1.5 6 6.5 11 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function BurgerIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
function Logo({ className, style }: { className?: string; style?: React.CSSProperties }) {
  // Light logo on the dark bar (all chrome bars are slate). Dark logo
  // (/logo-dark.png) is kept in /public for any future light-bar placement.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/logo-light.png" alt="Crain & Wooley" className={className} style={style} />
}

// ── Desktop nav item (label link + caret toggle + flyout) ──
function DesktopItem({ item, open, active, onOpen, onClose }: { item: NavNode; open: boolean; active: boolean; onOpen: () => void; onClose: () => void }) {
  const linkClass = `cw-nav-link${active ? ' cw-current' : ''}`
  const current = active ? 'page' : undefined
  if (!item.children?.length) {
    return (
      <li className="cw-nav-item">
        <Link href={item.href} className={linkClass} aria-current={current}>{item.label}</Link>
      </li>
    )
  }
  return (
    // CH-8: the flyout opens via CSS on hover/focus-within; mirror keyboard
    // focus into the JS open state so the caret's aria-expanded matches what a
    // keyboard user actually sees.
    <li
      className="cw-nav-item"
      onFocus={onOpen}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) onClose() }}
    >
      {/* No caret/chevron — dropdowns open on hover/focus-within (CSS), matching
          the original. aria-haspopup on the label conveys the submenu to AT. */}
      <Link href={item.href} className={linkClass} aria-haspopup="true" aria-expanded={open} aria-current={current}>{item.label}</Link>
      <ul className={`cw-flyout${open ? ' cw-open' : ''}`} role="menu">
        {item.children.map((child) => (
          <li key={child.label} role="none">
            <Link href={child.href} role="menuitem">{child.label}</Link>
            {child.children?.length ? (
              <ul className="cw-flyout-sub" role="menu">
                {child.children.map((gc) => (
                  <li key={gc.label} role="none">
                    <Link href={gc.href} role="menuitem">{gc.label}</Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </li>
  )
}

// ── Mobile drawer item (collapsible) ──
function MobileItem({ item, expanded, onToggle, onNavigate }: {
  item: NavNode; expanded: boolean; onToggle: () => void; onNavigate: () => void
}) {
  const hasChildren = !!item.children?.length
  return (
    <li>
      <div className="cw-drawer-row">
        <Link href={item.href} className="cw-drawer-link" onClick={onNavigate}>{item.label}</Link>
        {hasChildren && (
          <button
            type="button"
            className="cw-drawer-toggle"
            aria-expanded={expanded}
            aria-label={`Toggle ${item.label} submenu`}
            onClick={onToggle}
          >
            <Caret />
          </button>
        )}
      </div>
      {hasChildren && expanded && (
        <ul className="cw-drawer-sub">
          {item.children!.map((child) => (
            <li key={child.label}>
              <Link href={child.href} onClick={onNavigate}>{child.label}</Link>
              {child.children?.length
                ? child.children.map((gc) => (
                    <Link key={gc.label} href={gc.href} onClick={onNavigate} style={{ paddingLeft: 48, fontSize: 14 }}>
                      {gc.label}
                    </Link>
                  ))
                : null}
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

export function SiteHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState<Record<string, boolean>>({})
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const burgerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const wasOpen = useRef(false)

  // Mark the current top-level section (gold), matching the live site.
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    const base = href.replace(/\/$/, '')
    return pathname === base || pathname.startsWith(base + '/')
  }

  // Sticky-header scrolled state (adds the gold underline like the live site).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  // Escape closes the drawer and any open desktop submenu.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setDrawerOpen(false); setOpenMenu(null) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // CH-2: drawer focus management — on open, move focus to the close button;
  // on close (Escape / overlay / nav / X), return focus to the hamburger.
  useEffect(() => {
    if (drawerOpen && !wasOpen.current) {
      closeRef.current?.focus()
    } else if (!drawerOpen && wasOpen.current) {
      burgerRef.current?.focus()
    }
    wasOpen.current = drawerOpen
  }, [drawerOpen])

  // CH-2: trap Tab within the open drawer so focus can't escape to the
  // (inert) page behind it.
  const trapTab = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !drawerRef.current) return
    const f = drawerRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
    if (!f.length) return
    const first = f[0], last = f[f.length - 1]
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  }

  return (
    <>
      {/* CH-5: skip link — first focusable element on every page. */}
      <a href="#main" className="cw-skip-link">Skip to main content</a>

      {/* Announcement bar (gold) — CH-6: wrapped as a labelled region so its
          content isn't orphaned outside a landmark. */}
      <div className="cw-anno" role="region" aria-label="Site announcement">
        Register for our free{' '}
        <Link href="/webinar-registration/">webinar</Link>{' '}
        to compare wills vs trusts and how to avoid probate
      </div>

      <header className={`cw-site-header${scrolled ? ' cw-scrolled' : ''}`}>
        {/* ONE unified slate header block: full-height logo on the left, a
            two-row stack on the right (phones over nav), divided by a dashed
            rule that begins after the logo column. Matches the original. */}
        <div className="cw-container cw-header-inner">
          <Link href="/" className="cw-brand" title="Home" aria-label="Crain & Wooley — Home">
            <Logo className="cw-logo-img" />
          </Link>

          <div className="cw-header-right">
            {/* Top row: Call Us Today! + the three office phones, right-aligned.
                Its bottom border is the dashed divider. */}
            <div className="cw-phonerow">
              <span className="cw-call-label">Call Us Today!</span>
              {PHONES.map((p) => (
                <span className="cw-phone" key={p.city}>
                  <span className="cw-phone-city">{p.city}:</span>
                  <a className="cw-phone-num" href={`tel:${p.tel}`}>{p.display}</a>
                </span>
              ))}
            </div>
            {/* Bottom row: nav (right-aligned) ending at the Contact Us button. */}
            <div className="cw-navrow">
              <nav aria-label="Primary" className="cw-nav-wrap">
                <ul className="cw-nav">
                  {NAV.map((item) => (
                    <DesktopItem
                      key={item.label}
                      item={item}
                      open={openMenu === item.label}
                      active={isActive(item.href)}
                      onOpen={() => setOpenMenu(item.label)}
                      onClose={() => setOpenMenu((m) => (m === item.label ? null : m))}
                    />
                  ))}
                </ul>
              </nav>
              <Link href="/contact-us/" className="cw-contact-btn">Contact Us</Link>
            </div>
          </div>

          {/* Hamburger (below 1280px) */}
          <button
            ref={burgerRef}
            type="button"
            className="cw-burger"
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            aria-controls="cw-drawer"
            onClick={() => setDrawerOpen(true)}
          >
            <BurgerIcon />
          </button>

          {/* Mobile/tablet: gold circle call button on the right (matches the
              original's compact header — hamburger left, logo centered, this right). */}
          <a className="cw-header-phone" href="tel:9729451610" aria-label="Call Crain & Wooley">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2z" fill="currentColor" />
            </svg>
          </a>
        </div>
      </header>

      {/* Off-canvas drawer */}
      <div
        className={`cw-drawer-overlay${drawerOpen ? ' cw-open' : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />
      <div
        ref={drawerRef}
        id="cw-drawer"
        className={`cw-drawer${drawerOpen ? ' cw-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!drawerOpen}
        // CH-1: when closed the drawer is off-screen but in the DOM; `inert`
        // takes its links out of the tab order and the a11y tree so keyboard /
        // SR users don't land in invisible nav.
        inert={!drawerOpen}
        onKeyDown={trapTab}
      >
        <div className="cw-drawer-head">
          <Logo style={{ height: 48, width: 'auto' }} />
          <button ref={closeRef} type="button" className="cw-drawer-close" aria-label="Close menu" onClick={() => setDrawerOpen(false)}>
            &times;
          </button>
        </div>
        <ul className="cw-drawer-nav">
          {NAV.map((item) => (
            <MobileItem
              key={item.label}
              item={item}
              expanded={!!mobileOpen[item.label]}
              onToggle={() => setMobileOpen((s) => ({ ...s, [item.label]: !s[item.label] }))}
              onNavigate={() => setDrawerOpen(false)}
            />
          ))}
          <li className="cw-drawer-row">
            <Link href="/contact-us/" className="cw-drawer-link" onClick={() => setDrawerOpen(false)}>Contact Us</Link>
          </li>
        </ul>
      </div>
    </>
  )
}

// ── Footer ──

const FOOTER_LINKS: NavNode[] = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about-us/' },
  { label: 'Services', href: '/services/' },
  { label: 'Resources', href: '/resources/' },
  { label: 'Blogs', href: '/blogs/' },
  { label: 'Contact Us', href: '/contact-us/' },
]

const OFFICES = [
  {
    name: 'Plano Office — Principal Location',
    lines: ['2805 Dallas Parkway', 'Suite 400', 'Plano, TX 75093'],
    map: 'https://www.google.com/maps?cid=4579589250112574771',
  },
  {
    name: 'Mansfield Office',
    lines: ['1000 N Walnut Creek Dr.', 'Suite 120', 'Mansfield, TX 76063'],
    map: 'https://www.google.com/maps?cid=5436297226345094092',
  },
  {
    name: 'Fort Worth — By Appointment Only',
    lines: ['6040 Camp Bowie Blvd.', 'Suite 56', 'Fort Worth, TX 76116'],
    map: 'http://maps.google.com/maps?f=q&hl=en&z=15&q=6040%20Camp%20Bowie%20Blvd.,Fort%20Worth,TX,76116',
  },
]
const SOCIAL = [
  {
    label: 'Facebook', href: 'https://www.facebook.com/crainwooley/',
    icon: <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H17V3.6c-.3 0-1.3-.1-2.45-.1-2.43 0-4.05 1.48-4.05 4.2v2.2H7.8V13h2.7v8h3z" />,
  },
  {
    label: 'LinkedIn', href: 'https://www.linkedin.com/company/crain-wooley/about/',
    icon: <path d="M6.94 5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0zM3.3 8.4h3.3V21H3.3V8.4zM9.1 8.4h3.16v1.72h.05c.44-.83 1.5-1.7 3.1-1.7 3.32 0 3.93 2.18 3.93 5.02V21h-3.3v-5.9c0-1.4-.03-3.2-1.95-3.2-1.96 0-2.26 1.53-2.26 3.1V21H9.1V8.4z" />,
  },
  {
    label: 'Instagram', href: 'https://www.instagram.com/crainwooley/?hl=en',
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.3" cy="6.7" r="1.15" />
      </>
    ),
  },
]

export function SiteFooter() {
  return (
    <footer className="cw-site-footer">
      {/* Extra content row (matches the live multi-row footer height) */}
      <div className="cw-container cw-footer-top">
        <p className="cw-footer-tagline">Compassionate estate planning &amp; elder law for Dallas&ndash;Fort Worth families.</p>
        <Link href="/contact-us/" className="cw-btn-gold">Schedule a Consultation</Link>
      </div>
      <div className="cw-container cw-footer-grid">
        {/* Brand + phone + social */}
        <div>
          <Link href="/" title="Home" aria-label="Crain & Wooley — Home">
            <Logo className="cw-footer-logo" />
          </Link>
          <a className="cw-footer-phone" href="tel:9729451610">972-945-1610</a>
          <div className="cw-footer-social">
            {SOCIAL.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{s.icon}</svg>
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        <nav aria-label="Footer">
          <h2 className="cw-footer-head">Links</h2>
          <ul className="cw-footer-links">
            {FOOTER_LINKS.map((l) => (
              <li key={l.label}><Link href={l.href}>{l.label}</Link></li>
            ))}
          </ul>
        </nav>

        {/* Locations */}
        <div>
          <h2 className="cw-footer-head">Locations</h2>
          {OFFICES.map((o) => (
            <div className="cw-office" key={o.name}>
              <p className="cw-office-name">{o.name}</p>
              <address>
                {o.lines.map((line) => (<span key={line}>{line}<br /></span>))}
                <a className="cw-office-map" href={o.map} target="_blank" rel="noopener noreferrer" aria-label={`Map & Directions — ${o.name}`}>Map &amp; Directions</a>
              </address>
            </div>
          ))}
        </div>
      </div>

      {/* Legal strip (light) */}
      <div className="cw-legal">
        <div className="cw-container cw-legal-inner">
          <p className="cw-legal-disclaimer">
            The information on this website is for general information purposes only. Nothing on this
            site should be taken as legal advice for any individual case or situation. This information
            is not intended to create, and receipt or viewing does not constitute, an attorney-client relationship.
          </p>
          <div className="cw-legal-bottom">
            <p className="cw-legal-copy">&copy; 2026 All Rights Reserved.</p>
            <Link href="/site-map/">Site Map</Link>
            <Link href="/privacy-policy/">Privacy Policy</Link>
            <Link href="/site-search/">Site Search</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export function RevealScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){if(typeof window==='undefined'||!('IntersectionObserver'in window))return;var r=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(r){document.querySelectorAll('.reveal, .reveal-stagger').forEach(function(e){e.classList.add('in')});return;}var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}})},{threshold:0.18,rootMargin:'0px 0px -8% 0px'});function b(){document.querySelectorAll('.reveal:not(.in), .reveal-stagger:not(.in)').forEach(function(e){io.observe(e)})}if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',b)}else{b()}})();`,
      }}
    />
  )
}
