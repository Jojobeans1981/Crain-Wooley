import type { Metadata } from 'next'
import Link from 'next/link'
import { PILLARS } from '@/lib/learn/pillars'
import { PERSONA_LIST } from '@/lib/learn/personas'

export const metadata: Metadata = {
  title: 'Estate Planning, Explained — Learning Center | Crain & Wooley',
  description:
    'Plain-language guides to wills, trusts, probate, and protecting your family across Texas. Start with your situation or take a two-minute quiz. From DFW estate planning attorneys.',
  alternates: { canonical: '/learn' },
}

export default function LearnHubPage() {
  return (
    <div className="cw-container">
      {/* Hero */}
      <section className="pt-16 pb-10 max-w-3xl">
        <p className="learn-eyebrow">The Learning Center</p>
        <h1 className="learn-h1">
          Estate planning, explained in plain language.
        </h1>
        <p className="text-cw-ink-soft text-[1.25rem] leading-relaxed mb-7">
          No jargon, no pressure — just clear answers about wills, trusts, probate, and protecting the people you love.
          Start with your situation, or take a two-minute quiz.
        </p>
        <div className="flex flex-wrap gap-3.5">
          <Link href="/learn/trusts" className="cw-btn-primary">Start with Trusts</Link>
          <Link href="#quizzes" className="cw-btn-ghost">Take a quiz</Link>
        </div>
      </section>

      {/* Browse by life stage — persona landing pages */}
      <section className="pb-8" aria-labelledby="lifestage-h">
        <p className="learn-eyebrow">Browse by life stage</p>
        <h2 id="lifestage-h" className="learn-h2 mb-4">Find content for your situation</h2>
        <nav aria-label="Browse by life stage" className="flex flex-wrap gap-2.5">
          {PERSONA_LIST.map((p) => (
            <Link key={p.path} href={`/learn/for/${p.path}`} className="cw-btn-ghost">{p.kicker}</Link>
          ))}
        </nav>
      </section>

      {/* Persona router */}
      <section className="py-10" aria-labelledby="persona-h">
        <p className="learn-eyebrow">Start where you are</p>
        <h2 id="persona-h" className="learn-h2 mb-1">Find your path</h2>
        <p className="text-cw-ink-soft mb-7 max-w-xl">Pick the description that fits best and we will line up the right guides, in the right order.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 reveal">
          {PERSONA_LIST.map((p) => (
            <Link key={p.slug} href={`/learn/${p.startPillar}`} className="learn-card">
              <span className="learn-kicker">{p.kicker}</span>
              <h3 className="font-display text-[1.3rem] text-cw-ink mt-0.5 mb-2">{p.title}</h3>
              <p className="text-cw-ink-soft text-[15px] m-0">{p.blurb}</p>
              <span className="learn-card-cta">See the path →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Topic pillars */}
      <section className="py-10" aria-labelledby="pillars-h">
        <p className="learn-eyebrow">Browse by topic</p>
        <h2 id="pillars-h" className="learn-h2 mb-1">The essentials</h2>
        <p className="text-cw-ink-soft mb-7 max-w-xl">Nine cornerstone guides covering every part of a Texas estate plan.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 reveal">
          {PILLARS.map((p) => (
            <Link key={p.slug} href={`/learn/${p.slug}`} className="learn-card">
              <span className="learn-num">{p.num}</span>
              <h3 className="font-display text-[1.3rem] text-cw-ink mt-0.5 mb-2">{p.title}</h3>
              <p className="text-cw-ink-soft text-[15px] m-0">{p.blurb}</p>
              <span className="learn-card-cta">
                {p.clusterCount} articles{p.hasQuiz ? ' · Quiz inside' : ''}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured quiz */}
      <section id="quizzes" className="py-12">
        <div className="learn-quizband reveal">
          <div>
            <p className="learn-eyebrow learn-eyebrow-light">Two minutes, no email required to start</p>
            <h2 className="font-display text-cw-cream text-[1.85rem] mb-2 max-w-[18ch]">Do you actually need a trust?</h2>
            <p className="text-[#D9C7A8] m-0 max-w-[46ch]">
              Answer a few plain questions about your family and what you own — we will tell you whether a trust is worth a
              conversation, or whether a will may be all you need.
            </p>
          </div>
          <Link href="/learn/trusts" className="learn-quizband-btn">Take the quiz →</Link>
        </div>
      </section>
    </div>
  )
}
