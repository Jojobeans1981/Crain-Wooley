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
// Moved to ./BadgeWall (client component) for the arrow-navigated carousel.
export { BadgeWall } from './BadgeWall'

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

// ── 7. Testimonials ── (the #ReviewsS8 closer band: navy watermark, a framed
// PHOTO on the left + the review carousel on the right (the original's f_rev
// two-column layout). Data: the curated 8 from lib/reviews, the set the original
// features site-wide.)
export function ReviewsSection() {
  return (
    <section className="cw-reviews" aria-label="Client testimonials">
      <div className="cw-container cw-reviews-grid reveal">
        <div className="cw-reviews-photo">
          {/* unoptimized: serve the raw 1264x1107 PNG so the browser downscales it to
              the 593px column EXACTLY as the original does (the original serves the same
              full-res PNG). Next's optimizer was downscaling to a soft q75 ~460px variant
              — the dominant testimonials-photo diff (19.9% of the left half). */}
          <Image src="/interior/reviews-photo.png" alt="" fill sizes="(max-width: 900px) 100vw, 593px" quality={100} unoptimized style={{ objectFit: 'contain' }} />
        </div>
        <div className="cw-reviews-left">
          <Testimonials reviews={FEATURED_REVIEWS} />
          <Link href="/reviews/" className="cw-btn-gold cw-reviews-cta">See all Reviews</Link>
        </div>
      </div>
    </section>
  )
}

// ── 8. Comfort & Convenience value props ──
const VALUES = [
  { title: 'Expert Service', body: `Laws change all the time. We stay up to date with all the latest information so that you're covered. No one else in the region is as dedicated or educated in this area of law. We're the experts so you don't have to be.`,
    // Exact original glyph (Scorpion sprite #expert): group/family, filled gold.
    icon: <path fillRule="evenodd" clipRule="evenodd" d="M23.506 12.758L23.025 13.108L23.213 13.676C23.37 14.169 23.193 14.731 22.773 15.016C22.368 15.322 21.783 15.321 21.363 15.017L20.88 14.667L20.396 15.017C20.187 15.169 19.964 15.245 19.692 15.245C19.444 15.245 19.196 15.169 18.987 15.016C18.567 14.731 18.39 14.169 18.551 13.676L18.735 13.108L18.253 12.758C17.833 12.454 17.658 11.912 17.818 11.418C17.979 10.924 18.44 10.59 18.96 10.59L19.554 10.59L19.739 10.023C19.907 9.536 20.36 9.194 20.88 9.194C21.4 9.194 21.859 9.536 22.02 10.023L22.205 10.59L22.8 10.59C23.32 10.59 23.781 10.924 23.942 11.418L23.942 11.418C24.102 11.912 23.925 12.455 23.506 12.758ZM21.346 5.954L20.865 6.304L21.048 6.871C21.209 7.365 21.033 7.906 20.613 8.211C20.193 8.539 19.623 8.526 19.203 8.212L18.719 7.862L18.237 8.212C18.028 8.364 17.78 8.46 17.533 8.46C17.284 8.46 17.037 8.364 16.828 8.211C16.406 7.906 16.231 7.365 16.392 6.871L16.575 6.306L16.094 5.954C15.674 5.649 15.498 5.107 15.659 4.613C15.82 4.12 16.311 3.785 16.799 3.785L17.396 3.785L17.579 3.219C17.74 2.724 18.201 2.39 18.72 2.39C19.24 2.39 19.701 2.724 19.873 3.219L20.044 3.785L20.664 3.785C21.16 3.785 21.621 4.12 21.782 4.613C21.943 5.107 21.791 5.649 21.346 5.954ZM15.481 15.27L15.481 15.27C17.791 16.585 19.22 19.281 19.22 22.78C19.22 23.445 18.662 23.98 17.999 23.98L6.029 23.98C5.362 23.98 4.799 23.445 4.799 22.78C4.799 19.281 6.208 16.585 8.519 15.27C7.706 14.41 7.199 13.26 7.199 11.985C7.199 9.34 9.352 7.188 11.999 7.188C14.647 7.188 16.799 9.34 16.799 11.985C16.799 13.26 16.293 14.41 15.481 15.27ZM14.626 3.554L14.144 3.906L14.328 4.473C14.516 4.965 14.313 5.507 13.892 5.812C13.682 5.965 13.443 6.041 13.187 6.041C12.94 6.041 12.692 5.965 12.482 5.813L11.999 5.463L11.517 5.813C11.097 6.119 10.529 6.119 10.107 5.812C9.687 5.507 9.511 4.965 9.671 4.473L9.889 3.906L9.373 3.555C8.952 3.251 8.777 2.709 8.939 2.215C9.099 1.721 9.56 1.386 10.08 1.386L10.674 1.386L10.859 0.82C11.02 0.326 11.479 0.02 11.999 0.02C12.519 0.02 12.98 0.326 13.14 0.82L13.325 1.386L13.919 1.386C14.439 1.386 14.9 1.721 15.061 2.215C15.221 2.708 15.047 3.25 14.626 3.554ZM8.147 5.955L7.665 6.306L7.848 6.873C8.009 7.365 7.833 7.907 7.413 8.212C6.993 8.55 6.423 8.537 6.003 8.213L5.519 7.863L5.037 8.213C4.828 8.365 4.58 8.471 4.333 8.471C4.085 8.471 3.837 8.365 3.628 8.212C3.208 7.907 3.031 7.365 3.191 6.871L3.375 6.306L2.894 5.955C2.474 5.65 2.304 5.108 2.459 4.613C2.62 4.12 3.079 3.785 3.599 3.785L4.195 3.785L4.378 3.219C4.539 2.724 5.001 2.39 5.52 2.39C6.04 2.39 6.501 2.724 6.696 3.219L6.845 3.785L7.442 3.785C7.962 3.785 8.423 4.12 8.583 4.613C8.744 5.108 8.58 5.65 8.147 5.955ZM4.262 10.362L4.445 10.927L5.042 10.927C5.562 10.927 6.023 11.263 6.183 11.756C6.344 12.25 6.168 12.792 5.747 13.097L5.266 13.447L5.449 14.014L5.449 14.014C5.634 14.507 5.434 15.05 5.013 15.355C4.593 15.661 4.023 15.661 3.603 15.356L3.119 15.006L2.637 15.356C2.428 15.508 2.18 15.584 1.933 15.584C1.685 15.584 1.438 15.508 1.226 15.354C0.806 15.048 0.631 14.507 0.791 14.014L0.995 13.447L0.494 13.097C0.074 12.792 -0.102 12.25 0.059 11.756C0.22 11.263 0.679 10.927 1.199 10.927L1.796 10.927L1.979 10.362C2.14 9.867 2.601 9.533 3.12 9.533C3.64 9.533 4.101 9.867 4.262 10.362Z" /> },
  { title: 'Optional Lifetime Guarantee', body: `With our optional lifetime guarantee, your will and trust will be automatically updated over the years to ensure it stays current with best practices, reflects your current wishes and minimizes future confusion for your family.`,
    // Exact original glyph (Scorpion sprite #optional): thumbs-up, filled gold.
    icon: <path fillRule="evenodd" clipRule="evenodd" d="M23.986 11.59L23.986 11.59C23.879 12.115 23.668 12.611 23.343 13.057C23.289 13.099 23.237 13.19 23.22 13.276C23.203 13.367 23.212 13.462 23.247 13.565C23.557 14.49 23.409 15.509 22.847 16.317C22.798 16.447 22.778 16.552 22.787 16.655C22.823 16.931 22.844 17.247 22.849 17.563C22.821 18.291 22.534 18.986 22.04 19.521C22.023 19.594 21.952 19.717 21.949 19.774C21.946 20.142 21.925 20.524 21.884 20.918C21.752 21.744 21.242 22.507 20.492 22.959C19.924 23.297 19.296 23.482 18.62 23.497C17.989 23.572 17.355 23.497 16.721 23.521C15.609 23.543 14.515 23.41 13.424 23.125C12.433 22.863 11.458 22.544 10.477 22.239C9.728 21.999 9.001 21.699 8.24 21.615C7.534 21.541 7.189 21.101 7.193 20.391C7.213 17.381 7.193 14.295 7.193 11.247L7.193 10.962C7.208 10.771 7.294 10.585 7.44 10.388C7.587 10.217 7.783 10.11 7.997 10.075C8.24 10.046 8.466 9.937 8.64 9.766C9.121 9.285 9.584 8.805 10.023 8.287C10.743 7.435 11.463 6.559 12.168 5.691L12.168 5.691C12.331 5.504 12.479 5.306 12.612 5.096C13.004 4.436 13.121 3.685 13.265 2.935C13.436 2.187 13.603 1.525 14.089 0.884L14.089 0.884C14.184 0.744 14.316 0.633 14.469 0.596C14.622 0.489 14.791 0.459 14.96 0.473C15.337 0.488 15.742 0.536 16.083 0.617C16.433 0.731 16.767 0.869 17.081 1.073C17.603 1.475 17.96 2.003 18.074 2.634C18.355 3.75 18.301 4.949 17.922 6.011C17.726 6.551 17.441 7.06 17.185 7.586C17.103 7.759 17.038 7.941 16.988 8.186L17.226 8.186L21.116 8.186L21.116 8.187C21.624 8.139 22.124 8.27 22.561 8.529C23 8.787 23.357 9.161 23.634 9.61C23.763 9.956 23.899 10.316 24 10.687L24 10.687L24 11.408C23.986 11.468 23.967 11.528 23.986 11.59ZM5.502 21.557C5.389 21.58 5.273 21.588 5.158 21.584L1.08 21.584C0.852 21.612 0.621 21.558 0.429 21.43C0.237 21.302 0.098 21.11 0.036 20.888C0.025 20.9 0.014 20.861 0 20.849L0 10.841C0.078 10.575 0.255 10.349 0.495 10.21C0.639 10.133 0.798 10.088 0.961 10.075L5.281 10.075C5.852 10.075 6.284 10.512 6.284 11.134L6.284 14.495L6.284 20.508C6.284 21.063 5.981 21.44 5.502 21.557ZM3.551 18.046C3.373 17.868 3.133 17.765 2.88 17.77C2.628 17.763 2.387 17.866 2.208 18.045C2.046 18.224 1.953 18.465 1.92 18.717C1.92 18.969 2.02 19.22 2.197 19.392C2.373 19.571 2.614 19.674 2.866 19.678C3.169 19.709 3.371 19.582 3.555 19.402C3.737 19.221 3.841 18.974 3.841 18.717C3.833 18.465 3.73 18.238 3.551 18.046Z" /> },
  { title: 'Flat-Rate Pricing*', body: `Finally, you won't need a lawyer to understand your legal fees. We clearly communicate our pricing structure upfront, so you can feel comfortable with our service from start to finish. No surprises, no hidden fees.`,
    // Exact original glyph (Scorpion sprite #rate): dollar sign inside a circle, filled gold.
    icon: <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.402 0 0 5.371 0 11.999C0 18.628 5.402 24 12 24C18.628 24 23.999 18.628 23.999 11.999C23.999 5.371 18.628 0 12 0ZM16.323 9.117L14.883 9.117L14.881 8.758C14.881 7.367 13.75 6.236 12.36 6.236L11.639 6.236C10.249 6.236 9.117 7.367 9.117 8.758C9.117 10.148 10.249 11.278 11.639 11.278L12.36 11.278C14.545 11.278 16.323 13.058 16.323 15.267C16.323 17.306 14.735 19.004 12.721 19.185L12.721 20.645L11.279 20.645L11.279 19.185C9.263 19.004 7.681 17.306 7.681 15.267L7.681 14.882L9.117 14.882L9.119 15.267C9.119 16.656 10.249 17.763 11.639 17.763L12.361 17.763C13.75 17.763 14.883 16.656 14.883 15.267C14.883 13.851 13.75 12.72 12.361 12.72L11.639 12.72C9.453 12.72 7.683 10.942 7.683 8.758C7.683 6.694 9.263 4.996 11.279 4.813L11.279 3.353L12.721 3.353L12.721 4.813C14.735 4.996 16.323 6.694 16.323 8.758L16.323 9.117Z" /> },
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
        <ul className="cw-values-list cw-values-card reveal-stagger">
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
          <span className="cw-loc-flair" aria-hidden="true" />
        </div>
        <ul className="cw-loc-grid reveal-stagger">
          {LOCATIONS.map((l) => (
            <li key={l.city} className="cw-loc-card">
              <span className="cw-loc-thumb">
                <Image src={l.img} alt={`${l.city} office`} fill sizes="(max-width: 900px) 100vw, 360px" style={{ objectFit: 'cover' }} />
                <span className="cw-loc-tint" aria-hidden="true" />
              </span>
              <span className="cw-loc-body">
                <span className="cw-loc-city">{l.city}</span>
                {l.external
                  ? <a href={l.href} target="_blank" rel="noopener noreferrer" className="cw-btn-gold cw-loc-btn">Contact Us</a>
                  : <Link href={l.href} className="cw-btn-gold cw-loc-btn">Contact Us</Link>}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
