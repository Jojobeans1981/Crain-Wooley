import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PILLAR_SLUGS, PILLAR_BY_SLUG, type PillarSlug } from '@/lib/learn/pillars'
import { GUIDES } from '@/lib/learn/content'

type Params = { pillar: string }

export function generateStaticParams() {
  return PILLAR_SLUGS.map((pillar) => ({ pillar }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { pillar } = await params
  const guide = GUIDES[pillar as PillarSlug]
  if (!guide) return {}
  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    alternates: { canonical: `/learn/${pillar}` },
  }
}

export default async function PillarPage({ params }: { params: Promise<Params> }) {
  const { pillar } = await params
  const guide = GUIDES[pillar as PillarSlug]
  const meta = PILLAR_BY_SLUG[pillar]
  if (!guide || !meta) notFound()

  // FAQ structured data (preserve the firm's existing rich-result coverage)
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <article className="learn-article cw-container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <nav aria-label="Breadcrumb" className="learn-breadcrumb">
        <Link href="/learn">Learn</Link> <span aria-hidden="true">→</span> <span aria-current="page">{meta.title}</span>
      </nav>
      <p className="learn-eyebrow">{guide.eyebrow}</p>
      <h1 className="learn-h1-article">{guide.title}</h1>
      <p className="learn-lede">
        <strong>{guide.leadIn}</strong> {guide.lede}
      </p>

      {guide.sections.map((s, i) => (
        <section key={i}>
          <h2 className="font-display text-cw-ink font-bold text-[1.7rem] mt-10 mb-3">{s.h2}</h2>
          {s.body?.map((p, j) => (
            <p key={j} className="learn-p">{p}</p>
          ))}
          {s.bullets && (
            <ul className="learn-ul">
              {s.bullets.map((b, k) => (
                <li key={k}>
                  {b.strong && <strong>{b.strong} </strong>}
                  {b.text}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      {/* Persona callout */}
      <div className="cw-panel-gold learn-callout">
        <strong className="text-cw-gold-dark">{guide.callout.title}</strong>
        <ul className="learn-ul mt-2">
          {guide.callout.items.map((it, i) => (
            <li key={i}>
              {it.strong && <strong>{it.strong} </strong>}
              {it.text}
            </li>
          ))}
        </ul>
      </div>

      {/* Reading list — links to existing /blogs posts (never moved) */}
      <hr className="learn-hr" />
      <h3 className="font-display text-cw-ink font-bold text-[1.25rem] mb-3">Keep reading</h3>
      <div className="learn-readlist">
        {guide.readlist.map((r) => (
          <a key={r.url} href={r.url}>{r.title} →</a>
        ))}
      </div>

      {/* Quiz CTA */}
      <div className="learn-quizcta">
        <h3 className="font-display text-cw-cream text-[1.5rem] mb-2">{guide.quiz.title}</h3>
        <p className="text-[#D9C7A8] mb-4 m-0">{guide.quiz.body}</p>
        <Link href={guide.quiz.href} className="learn-quizband-btn">{guide.quiz.cta} →</Link>
      </div>

      {/* Book CTA */}
      <div className="learn-bookcta">
        <p className="m-0 mb-3.5">
          When you are ready to talk it through, Crain &amp; Wooley offers comprehensive, <strong>flat-rate</strong> planning
          across Dallas–Fort Worth — offices in Plano, Mansfield, and Fort Worth, every document explained in plain language.
        </p>
        <Link href="/get-started" className="cw-btn-primary">Book a consultation →</Link>
        <span className="text-cw-ink-mute text-[14px] ml-3">Plano: (972) 945-1610</span>
      </div>

      {/* FAQ */}
      <h2 className="font-display text-cw-ink font-bold text-[1.7rem] mt-12 mb-3">Frequently asked questions</h2>
      <div className="learn-faq">
        {guide.faq.map((f, i) => (
          <details key={i}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>

      <p className="learn-disclaimer">{guide.disclaimer}</p>
    </article>
  )
}
