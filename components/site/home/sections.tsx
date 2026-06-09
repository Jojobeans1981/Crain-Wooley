import Link from 'next/link'
import Image from 'next/image'
import { Testimonials } from './Testimonials'
import { HeroVideo } from './HeroVideo'
import { FEATURED_REVIEWS } from '@/lib/reviews'

/* ════════════════════════════════════════════════════════════════════════
 * Homepage sections — literal clone of estateplanningdfw.law (body only;
 * SiteHeader/SiteFooter come from the marketing layout). All copy is verbatim
 * from the captured home.html. Stage-1 tokens only. Section order matches the
 * live DOM. Re-hosted assets live under /public/home.
 * ════════════════════════════════════════════════════════════════════════ */

// ── 1. Mainstage hero ──
export function Hero() {
  return (
    <section className="cw-hero cw-hero-anim" aria-label="Introduction">
      <div className="cw-hero-bg">
        <HeroVideo />
        <div className="cw-hero-overlay" aria-hidden="true" />
      </div>
      <div className="cw-container cw-hero-inner">
        {/* Faithful to estateplanningdfw.law: the hero caption reads "Life Can Be
            Full of Surprises"; the page's single <h1> lives in the intro below. */}
        <p className="cw-hero-title">Life Can Be Full of Surprises</p>
        <p className="cw-hero-subtitle">The Cost of Planning for Your Future Shouldn&rsquo;t Be One of Them</p>
        <p className="cw-hero-sub">
          Crain &amp; Wooley offers comprehensive, flat-rate services that serve clients of all
          backgrounds throughout their lifetime. No matter where you are in life, we make estate
          planning simple to better prepare you and your family for the future.
        </p>
        <Link href="/contact-us/" className="cw-btn-gold">Book a Consultation</Link>
      </div>
    </section>
  )
}

// ── 2. Award / credential badge wall ──
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
function BadgeImg({ b, decorative }: { b: Badge; decorative?: boolean }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="cw-badge" src={b.src} alt={decorative ? '' : b.alt} loading="lazy" />
}

export function BadgeWall() {
  return (
    <section className="cw-badges" aria-label="Awards and credentials">
      {/* Single horizontal auto-advancing strip (CSS marquee). The list is
          rendered twice so the loop is seamless; the second copy is hidden from
          assistive tech. prefers-reduced-motion stops the motion and turns the
          strip into a manually scrollable row (see globals.css). */}
      <div className="cw-badge-strip">
        <ul className="cw-badge-track">
          {BADGES.map((b) => (
            <li key={b.src} className="cw-badge-item">
              {b.href
                ? <a href={b.href} target="_blank" rel="noopener noreferrer" aria-label={b.alt}><BadgeImg b={b} /></a>
                : <BadgeImg b={b} />}
            </li>
          ))}
          {BADGES.map((b) => (
            <li key={`dup-${b.src}`} className="cw-badge-item" aria-hidden="true">
              <BadgeImg b={b} decorative />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// ── 3. Intro / "Protect Your Legacy" + homepage video ──
const GUIDE_VIDEO = process.env.NEXT_PUBLIC_GUIDE_VIDEO_URL

// Below-the-fold SEO copy (verbatim), revealed by the native "Continue Reading"
// disclosure. Plain strings rendered as expressions to keep markup clean.
const INTRO_MORE: { h2?: string; h3?: string; p?: string }[] = [
  { p: `Our services include wills, trusts, probate consultation, Medicaid and long-term care planning, tax strategies, and business transition support for family companies. We proudly serve clients throughout Dallas-Fort Worth, with offices in Plano and Mansfield. Because Texas law permits independent administration for many estates, our local insight proves valuable whether you hold assets in several DFW cities or need to coordinate for multiple beneficiaries in the area.` },
  { p: `There are no hidden fees in our flat-rate pricing, and our in-person and virtual consultations make building an estate plan convenient, regardless of your location or the changes in the law.` },
  { h2: `What to Expect During the Estate Planning Process in Fort Worth` },
  { p: `When you begin working on an estate plan in Fort Worth, expect a detailed review of your assets, family situation, and long-term wishes. After the initial consultation, we outline the main options available under Texas law, such as wills, trusts, and powers of attorney. We also discuss how Tarrant County probate courts could affect your estate and review options to help reduce the time and costs often associated with court processes.` },
  { p: `At Crain & Wooley, we keep our process clear so you always know the next step and what information to gather. Local laws in North Texas often guide how we structure your estate plan. For example, Texas allows for independent administration—a simplified probate process—for many estates, which may save your beneficiaries significant time and money.` },
  { p: `We tailor all guidance to reflect Fort Worth's legal realities and community values, giving you practical steps to document your wishes and ensure your estate plan stays current. If your property or beneficiaries span more than one Texas county, we discuss how different rules might apply and what that means for your plan. Our team offers support from step one to final review, with clear communication and up-to-date guidance throughout.` },
  { p: `In many cases, we also talk through how your plan might interact with elder care needs, Medicaid eligibility, and potential long-term care costs, so you can anticipate how today's decisions may affect tomorrow's options. By walking through concrete examples from local families who have navigated the Tarrant County and Dallas County probate systems, we help you see how a thoughtful plan can reduce stress for the people you care about most.` },
  { h2: `Frequently Asked Questions` },
  { h3: `What is the difference between a will and a trust in Texas?`, p: `A will states how your assets pass after your death and usually goes through probate in your home county, such as Tarrant or Dallas. A trust creates a private arrangement that can help your heirs avoid probate court, enable a faster transfer of assets, and give you more control over how property gets distributed.` },
  { h3: `How often should I update my estate plan?`, p: `You should review your estate plan whenever you experience significant life changes, such as marriage, divorce, the birth of a child, or a big move. Texas law and local court practices sometimes change, so regular updates help ensure that your wishes are honored by the courts.` },
  { h3: `Do I need an estate plan if I do not own much property?`, p: `Yes, an estate plan goes beyond handling property. It gives clear directions for medical care, guardianship of children, and other personal matters. Even a basic plan provides clarity for your loved ones and makes transitions smoother.` },
  { h3: `What happens if I die without a will in Texas?`, p: `When you pass away without a legal will, the state uses Texas intestacy laws to determine exactly how your assets are divided. This default process can leave your family dealing with unnecessary delays, additional legal fees in local probate courts, and the unintended distribution of your property.` },
  { h3: `What is a medical power of attorney?`, p: `A medical power of attorney allows you to designate a trusted person to make healthcare decisions on your behalf if an illness or injury leaves you unable to communicate. Having this document ready prevents disputes among family members and ensures local doctors follow the specific care plan you want.` },
  { h2: `Speak With an Estate Planning Attorney in Fort Worth Today` },
  { p: `Whether you need to establish a new estate plan or update an existing one, Crain & Wooley offers local insight, responsive service, and straightforward pricing. Our estate planning attorneys in Fort Worth help you create a plan that protects your assets, honors your wishes, and reduces potential burdens for your family.` },
]

export function IntroVideo() {
  return (
    <section className="cw-intro" aria-label="About Crain & Wooley">
      <div className="cw-container cw-intro-grid reveal">
        <div className="cw-intro-copy">
          <h1 className="cw-intro-title">Estate Planning Attorneys in Dallas-Fort Worth</h1>
          <h2 className="cw-h2">Let Our Compassionate Lawyers Help Protect Your Legacy</h2>
          <p>
            At <Link href="/about-us/">Crain &amp; Wooley</Link>, planning for the future means making
            decisions you can trust. From major life changes to inevitable losses, it&rsquo;s essential to
            have an <Link href="/estate-planning/">estate plan</Link> in place that helps you protect both
            your loved ones and your assets.
          </p>
          <p>{`Our team provides step-by-step guidance, so you can make informed decisions about your estate plan across the Dallas-Fort Worth area. We draw on years of experience serving clients under Texas estate and probate laws, taking a straightforward approach so you clearly understand every part of the process. Our experience with probate courts in Tarrant and Dallas counties allows us to tailor strategies that fit your needs and help the process move efficiently for area families and businesses.`}</p>
          <p className="cw-callout">
            Call <a href="tel:9729451610">(972) 945-1610</a> to schedule your confidential estate planning
            consultation with our Dallas Fort Worth attorneys today to protect your family legacy and secure your assets.
          </p>
          <p>{`That is why we take great pride in guiding clients of all backgrounds and income levels through each phase of the planning process. When you choose our firm, we make it our top priority to prepare you for the future and ease potential burdens on your family.`}</p>
          <p>{`When we create your estate plan, we explain every document in plain language, so you know exactly how it operates for your needs. Families in Fort Worth and the wider DFW area come to us with unique circumstances, from business succession planning to blended family matters and property ownership in several locations. Our estate planning attorneys build solutions that grow with you, keeping your documents up to date as Texas law continues to evolve.`}</p>
          <h2 className="cw-h2">Choosing the Right Estate Planning and Elder Law Firm</h2>
          <p>{`Selecting an attorney to handle your estate, long-term care, or probate concerns is a personal decision, and it helps to understand how different firms approach this work. When you meet with an estate lawyer in our Dallas-Fort Worth offices, we talk in detail about your priorities, your family relationships, and any worries you have about future medical needs, guardianship, or business continuity. We also review how Texas probate courts in counties such as Tarrant and Dallas are likely to handle your estate, so you can see how today's planning choices may play out in real court procedures.`}</p>
          <p>{`As we walk through your options, we explain the flat-rate nature of most planning services, what is included in those packages, and when hourly work might become necessary for litigation or contested matters. This transparent structure allows you to compare options confidently and decide whether you want ongoing plan maintenance, help with elder law questions like Medicaid eligibility, or a more limited set of documents for now. By the end of your initial meeting, you should have a clear sense of the next steps, the documents we recommend, and how our team will stay in touch as your plan is drafted, reviewed, and signed.`}</p>

          <details className="cw-readmore">
            <summary>Continue Reading</summary>
            <div className="cw-readmore-body">
              {INTRO_MORE.map((b, i) => (
                <div key={i}>
                  {b.h2 && <h2 className="cw-h2">{b.h2}</h2>}
                  {b.h3 && <h3 className="cw-h3">{b.h3}</h3>}
                  {b.p && <p>{b.p}</p>}
                </div>
              ))}
              <p className="cw-callout">
                Call <a href="tel:9729451610">(972) 945-1610</a> to our Fort Worth Office to schedule a
                consultation. Let our team help you plan confidently and protect what matters most.
              </p>
            </div>
          </details>
        </div>

        <div className="cw-intro-media">
          {/* Live intro right column is ONLY the attorney video (Justin Crain /
              Jacob Wooley). The sunset/office photo was a duplicate of the image
              in the "Download Our Free Guide" band, so it has been removed. */}

          {/* Welcome / intro video (Scorpion CWBOTH30). The full file is ~123 MB
              so it is served from a hosted source via NEXT_PUBLIC_GUIDE_VIDEO_URL;
              until that env var is set we show the poster frame with a play cue. */}
          {GUIDE_VIDEO ? (
            <video className="cw-intro-video" controls preload="metadata" playsInline poster="/home/video-poster.jpg">
              <source src={GUIDE_VIDEO} type="video/mp4" />
            </video>
          ) : (
            <div className="cw-intro-video cw-intro-video-poster" role="img" aria-label="Welcome video from Crain & Wooley (coming soon)">
              <Image src="/home/video-poster.jpg" alt="" fill sizes="(max-width: 900px) 100vw, 560px" style={{ objectFit: 'cover' }} />
              <span className="cw-intro-play" aria-hidden="true" />
            </div>
          )}
          {/* Quick path into the Learning Center self-assessment. */}
          <div className="cw-intro-quiz">
            <h3 className="cw-intro-quiz-title">Which Estate Plan Do I Need?</h3>
            <p className="cw-intro-quiz-copy">Free 2-minute quiz &mdash; answer a few questions about your life and goals, and we&rsquo;ll point you to the right place to start.</p>
            <Link href="/learn/quizzes/which-plan-do-i-need" className="cw-btn-gold">Take the Quiz</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── 4. Free Estate Planning Guide band ──
export function GuideBand() {
  return (
    <section className="cw-guide" aria-label="Free Estate Planning Guide">
      <Image className="cw-guide-bg" src="/home/guide-band-bg.jpg" alt="" fill sizes="100vw" style={{ objectFit: 'cover' }} aria-hidden="true" />
      <div className="cw-guide-tint" aria-hidden="true" />
      <div className="cw-container cw-guide-inner reveal">
        <div className="cw-guide-copy">
          <strong className="cw-eyebrow cw-eyebrow-light">Download Our Free Estate Planning Guide</strong>
          <p>The world of estate planning can be overwhelming, but our team aims to make things simple. Download our Free Estate Planning Guide today to learn more.</p>
          <Link href="/resources/free-estate-planning-guide/" className="cw-btn-gold">Download the Guide</Link>
        </div>
        <div className="cw-guide-photo">
          <Image src="/home/guide-feature.jpg" alt="Crain & Wooley Free Estate Planning Guide" width={420} height={460} style={{ width: '100%', height: 'auto' }} />
        </div>
      </div>
    </section>
  )
}

// ── 5. Practice areas ──
const SERVICES = [
  { title: 'Estate Planning', href: '/estate-planning/', img: '/home/service-estate-planning.jpg' },
  { title: 'Probate', href: '/probate/', img: '/home/service-probate.jpg' },
  { title: 'Business Development', href: '/business-law/', img: '/home/service-business.jpg' },
]

export function PracticeAreas() {
  return (
    <section className="cw-services" aria-label="Practice areas">
      <div className="cw-container">
        <div className="cw-section-head reveal">
          <span className="cw-eyebrow">Estate Planning Services</span>
          <h2 className="cw-h2">What We Can Do For You</h2>
        </div>
        <ul className="cw-service-grid reveal-stagger">
          {SERVICES.map((s) => (
            <li key={s.href}>
              <Link href={s.href} className="cw-service-card">
                {/* HOME-3: decorative — the visible title below is the label, so
                    an alt here would be redundant (axe image-redundant-alt). */}
                <Image src={s.img} alt="" fill sizes="(max-width: 900px) 100vw, 380px" style={{ objectFit: 'cover' }} />
                <span className="cw-service-tint" aria-hidden="true" />
                <span className="cw-service-title">{s.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// ── 6. Decorative image divider ──
export function Divider() {
  return (
    <section className="cw-divider" aria-hidden="true">
      <Image src="/home/divider-bg.jpg" alt="" fill sizes="100vw" style={{ objectFit: 'cover' }} />
    </section>
  )
}

// ── 7. Testimonials ── (data: lib/reviews, shared with the /reviews page)
export function ReviewsSection() {
  return (
    <section className="cw-reviews" aria-label="Client testimonials">
      <div className="cw-container cw-reviews-grid reveal">
        <div className="cw-reviews-left">
          <Testimonials reviews={FEATURED_REVIEWS} />
          <Link href="/reviews/" className="cw-btn-gold cw-reviews-cta">View All Reviews</Link>
        </div>
        <div className="cw-reviews-photo">
          <Image src="/home/reviews-feature.jpg" alt="Crain & Wooley attorneys" fill sizes="(max-width: 900px) 100vw, 460px" style={{ objectFit: 'cover' }} />
        </div>
      </div>
    </section>
  )
}

// ── 8. Comfort & Convenience value props ──
const VALUES = [
  { title: 'Expert Service', body: `Laws change all the time. We stay up to date with all the latest information so that you're covered. No one else in the region is as dedicated or educated in this area of law. We're the experts so you don't have to be.`,
    icon: <path d="M12 2 4 5v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V5l-8-3z" /> },
  { title: 'Optional Lifetime Guarantee', body: `With our optional lifetime guarantee, your will and trust will be automatically updated over the years to ensure it stays current with best practices, reflects your current wishes and minimizes future confusion for your family.`,
    icon: <path d="M12 2a10 10 0 1 0 9.5 13M12 7v5l3 2M21 4v5h-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /> },
  { title: 'Flat-Rate Pricing*', body: `Finally, you won't need a lawyer to understand your legal fees. We clearly communicate our pricing structure upfront, so you can feel comfortable with our service from start to finish. No surprises, no hidden fees.`,
    icon: <path d="M20 12 12 4H5v7l8 8 7-7zM8 8h.01" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /> },
]

export function ValueProps() {
  return (
    <section className="cw-values" aria-label="Why choose us">
      <div className="cw-container cw-values-grid">
        <div className="cw-values-head reveal">
          <span className="cw-eyebrow cw-eyebrow-light">Designed for Your Comfort &amp; Convenience</span>
          <h2 className="cw-h2 cw-h2-light">Estate Planning With Us Means:</h2>
          <Link href="/contact-us/" className="cw-btn-gold">Contact Us</Link>
        </div>
        <ul className="cw-values-list reveal-stagger">
          {VALUES.map((v) => (
            <li key={v.title} className="cw-value">
              <span className="cw-value-icon" aria-hidden="true">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">{v.icon}</svg>
              </span>
              <div>
                <h3 className="cw-value-title">{v.title}</h3>
                <p className="cw-value-body">{v.body}</p>
                {v.title === 'Flat-Rate Pricing*' && (
                  <p className="cw-value-fine">*Our flat rate fees apply only to proactive planning services.</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// ── 9. Latest News ──
const POSTS = [
  { date: 'May 31, 2026', title: 'How to Choose the Right Person for Your Power of Attorney', href: '/blogs/2026/may/how-to-choose-the-right-person-for-your-power-of/', img: '/home/blog/post-1.jpg' },
  { date: 'May 12, 2026', title: 'Got a Side Hustle or Freelance Gig? Protect Your Business in Your Estate Plan', href: '/blogs/2026/may/got-a-side-hustle-or-freelance-gig-protect-your-/', img: '/home/blog/post-2.jpg' },
  { date: 'May 3, 2026', title: 'The Role of an Executor in Probate and How to Choose the Right One', href: '/blogs/2026/may/the-role-of-an-executor-in-probate-and-how-to-ch/', img: '/home/blog/post-3.jpg' },
]

export function LatestNews() {
  return (
    <section className="cw-news" aria-label="Latest news">
      <div className="cw-container">
        <div className="cw-section-head reveal">
          <h2 className="cw-h2">Latest News From Crain &amp; Wooley</h2>
        </div>
        <ul className="cw-news-grid reveal-stagger">
          {POSTS.map((p) => (
            <li key={p.href}>
              <Link href={p.href} className="cw-news-card">
                <span className="cw-news-thumb">
                  <Image src={p.img} alt="" fill sizes="(max-width: 900px) 100vw, 360px" style={{ objectFit: 'cover' }} />
                </span>
                <span className="cw-news-date">{p.date}</span>
                <span className="cw-news-title">{p.title}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="cw-news-cta">
          <Link href="/blogs/" className="cw-btn-ghost">Visit Our Blog</Link>
        </div>
      </div>
    </section>
  )
}

// ── 10. Locations / scheduler ──
const LOCATIONS = [
  { city: 'Plano', img: '/home/cta/plano.jpg', href: '/plano-contact-us/', external: false },
  { city: 'Mansfield', img: '/home/cta/mansfield.png', href: 'https://outlook.office.com/book/CrainWooleyCopy3@crainwooley.law/?ismsaljsauthenabled=true', external: true },
  { city: 'Ft Worth', img: '/home/cta/ft-worth.jpg', href: 'https://outlook.office.com/book/CrainWooleyCopy3@crainwooley.law/?ismsaljsauthenabled=true', external: true },
]

export function Locations() {
  return (
    <section className="cw-locations" aria-label="Schedule a consultation">
      <div className="cw-container">
        <div className="cw-section-head cw-section-head-light reveal">
          <h2 className="cw-h2 cw-h2-light">Schedule a Consultation Today!</h2>
          <p className="cw-locations-sub">Start By Selecting a Convenient Location</p>
        </div>
        <ul className="cw-loc-grid reveal-stagger">
          {LOCATIONS.map((l) => (
            <li key={l.city} className="cw-loc-card">
              <span className="cw-loc-thumb">
                <Image src={l.img} alt={`${l.city} office`} fill sizes="(max-width: 900px) 100vw, 360px" style={{ objectFit: 'cover' }} />
              </span>
              <span className="cw-loc-city">{l.city}</span>
              {l.external
                ? <a href={l.href} target="_blank" rel="noopener noreferrer" className="cw-btn-gold cw-loc-btn">Contact Us</a>
                : <Link href={l.href} className="cw-btn-gold cw-loc-btn">Contact Us</Link>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
