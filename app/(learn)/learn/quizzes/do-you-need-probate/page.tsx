import type { Metadata } from 'next'
import QuizRunner from '@/components/learn/QuizRunner'
import { PROBATE_QUIZ } from '@/lib/learn/scoring'

export const metadata: Metadata = {
  title: 'Do You Need Probate? — 2-Minute Quiz | Crain & Wooley',
  description: 'Answer a few questions about the estate and how things were titled to see whether full Texas probate is likely required — or whether a simpler alternative may fit.',
}

export default function Page() {
  return <QuizRunner def={PROBATE_QUIZ} crumbLabel="Probate" crumbHref="/learn/probate" />
}
