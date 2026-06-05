export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { auditEvent } from '@/lib/audit'
import { scoreQuiz, QUIZZES } from '@/lib/learn/scoring'

/**
 * Learning Center quiz capture.
 * Low-friction top-of-funnel lead from a /learn quiz (email-only). Creates or
 * updates a Lead, tags source=quiz:<slug>, stores the computed tier for the
 * team, and logs an audit event. Does NOT seed the Ghost nurture sequence —
 * quiz leads are softer than a full /api/intake submission; the team nurtures
 * them deliberately.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email: string | undefined = body?.email?.trim()
    const firstName: string = (body?.firstName?.trim() || '').slice(0, 80)
    const quizSlug: string = body?.quizSlug || 'do-you-need-a-trust'
    const answers: Record<string, string> = body?.answers ?? {}
    const def = QUIZZES[quizSlug]

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'A valid email is required.' }, { status: 400 })
    }
    if (!def) {
      return NextResponse.json({ success: false, error: 'Unknown quiz.' }, { status: 400 })
    }

    const result = scoreQuiz(quizSlug, answers)
    const scorePart = typeof result.score === 'number' ? ` score=${result.score}/${result.maxScore}` : ''
    const quizNote =
      `[Quiz: ${quizSlug}] tier=${result.tier}${scorePart}` +
      (result.primaryPersona ? ` persona=${result.primaryPersona}` : '') +
      ` answers=${JSON.stringify(answers)}`

    const existing = await prisma.lead.findUnique({ where: { email } })

    let leadId: string
    if (existing) {
      // Don't clobber a real intake lead — just append the quiz result to notes.
      const updated = await prisma.lead.update({
        where: { email },
        data: { notes: existing.notes ? `${existing.notes}\n${quizNote}` : quizNote },
      })
      leadId = updated.id
    } else {
      const created = await prisma.lead.create({
        data: {
          firstName: firstName || email.split('@')[0].slice(0, 40),
          lastName: '(Learning Center quiz)',
          email,
          phone: '',
          practiceArea: 'ESTATE_PLANNING',
          caseType: `${def.title} (quiz)`,
          description: `Took the "${def.title}" quiz → result: ${result.tier}.`,
          urgency: 'RESEARCHING',
          source: `quiz:${quizSlug}`,
          notes: quizNote,
        },
      })
      leadId = created.id
    }

    await auditEvent({
      type: 'LEAD_CREATED',
      leadId,
      meta: { via: 'quiz', quizSlug, tier: result.tier, score: result.score, persona: result.primaryPersona },
    })

    return NextResponse.json({
      success: true,
      leadId,
      result: {
        tier: result.tier,
        headline: result.headline,
        explanation: result.explanation,
        primaryPersona: result.primaryPersona,
      },
    })
  } catch (error) {
    console.error('[LEARN_QUIZ_ERROR]', error)
    return NextResponse.json({ success: false, error: 'Could not save your answers.' }, { status: 500 })
  }
}
