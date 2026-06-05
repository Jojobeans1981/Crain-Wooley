import type { Metadata } from 'next'
import QuizRunner from '@/components/learn/QuizRunner'
import { TRUST_QUIZ } from '@/lib/learn/scoring'

export const metadata: Metadata = {
  title: 'Do You Need a Trust? — 2-Minute Quiz | Crain & Wooley',
  description: 'Answer a few plain questions about your family and what you own to see whether a trust is worth a conversation — or whether a will may be all you need.',
}

export default function Page() {
  return <QuizRunner def={TRUST_QUIZ} crumbLabel="Trusts" crumbHref="/learn/trusts" />
}
