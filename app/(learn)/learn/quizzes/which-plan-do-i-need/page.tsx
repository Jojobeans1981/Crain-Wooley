import type { Metadata } from 'next'
import QuizRunner from '@/components/learn/QuizRunner'
import { WHICH_PLAN_QUIZ } from '@/lib/learn/scoring'

export const metadata: Metadata = {
  title: 'Which Estate Plan Do I Need? — 2-Minute Quiz | Crain & Wooley',
  description: 'A few questions about your life and goals, and we will point you to the right guide to start with — wills, trusts, probate, or another part of a Texas estate plan.',
}

export default function Page() {
  return <QuizRunner def={WHICH_PLAN_QUIZ} />
}
