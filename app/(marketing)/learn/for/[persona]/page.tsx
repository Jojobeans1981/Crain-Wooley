import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PERSONA_PATHS, PERSONA_BY_PATH } from '@/lib/learn/personas'
import type { SearchRecord } from '@/lib/search/types'
import indexData from '@/public/search-index.json'

/**
 * Persona ("by life stage") landing pages — /learn/for/[persona]. Lists the
 * content tagged to a persona (curated OVERRIDES + auto-suggested, computed in
 * the search-index build), grouped by type. Presentation/additions only.
 */
const INDEX = indexData as SearchRecord[]
type Params = { persona: string }

const GROUPS: { type: SearchRecord['type']; label: string }[] = [
  { type: 'learn', label: 'Guides' },
  { type: 'page', label: 'Pages' },
  { type: 'blog', label: 'From the Blog' },
  { type: 'quiz', label: 'Quizzes' },
]

export function generateStaticParams() {
  return PERSONA_PATHS.map((persona) => ({ persona }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { persona } = await params
  const p = PERSONA_BY_PATH[persona]
  if (!p) return {}
  return {
    title: `Estate Planning for ${p.kicker} | Crain & Wooley`,
    description: p.blurb,
    alternates: { canonical: `/learn/for/${persona}` },
  }
}

export default async function PersonaLandingPage({ params }: { params: Promise<Params> }) {
  const { persona } = await params
  const meta = PERSONA_BY_PATH[persona]
  if (!meta) notFound()

  const tagged = INDEX.filter((r) => r.personas?.includes(persona))

  return (
    <div className="cw-article-bg">
      <header className="legacy-banner">
        <div className="cw-container legacy-banner-inner">
          <nav aria-label="Breadcrumb" className="legacy-crumbs">
            <ol>
              <li><Link href="/learn">Learning Center</Link></li>
              <li><span>By life stage</span></li>
              <li><span aria-current="page">{meta.kicker}</span></li>
            </ol>
          </nav>
          <h1 className="legacy-banner-title">Estate Planning for {meta.kicker}</h1>
        </div>
      </header>

      <div className="cw-container legacy-body">
        <div className="learn-article">
          <p className="learn-lede">{meta.blurb}</p>

          {tagged.length === 0 ? (
            <p className="learn-p">
              We are still tagging content for this audience. In the meantime, browse the{' '}
              <Link href="/learn">Learning Center</Link>.
            </p>
          ) : (
            GROUPS.map((g) => {
              const items = tagged.filter((r) => r.type === g.type)
              if (!items.length) return null
              return (
                <section key={g.type}>
                  <h2 className="legacy-h2">{g.label}</h2>
                  <nav aria-label={`${meta.kicker} — ${g.label}`} className="learn-readlist">
                    {items.map((r) => (
                      <Link key={r.url} href={r.url}>{r.title} →</Link>
                    ))}
                  </nav>
                </section>
              )
            })
          )}

          <aside className="learn-bookcta" aria-label="Schedule a consultation">
            <p className="m-0 mb-3.5">
              Ready to talk it through? Crain &amp; Wooley offers comprehensive, <strong>flat-rate</strong> planning
              across Dallas–Fort Worth — every document explained in plain language.
            </p>
            <Link href="/get-started" className="cw-btn-primary">Book a consultation →</Link>
            <span className="text-cw-ink-mute text-[14px] ml-3">Plano: (972) 945-1610</span>
          </aside>
        </div>
      </div>
    </div>
  )
}
