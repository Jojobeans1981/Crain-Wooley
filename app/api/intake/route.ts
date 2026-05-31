export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { qualifyLead } from '@/lib/qualify'
import { buildSequenceJobsFromTemplates } from '@/lib/ghost/sequences'
import type { IntakeForm } from '@/lib/intake/schema'
import { deriveGateInput, buildLeadData, mapPracticeArea, mapUrgency } from '@/lib/intake/derive'
import { auditEvent } from '@/lib/audit'

export async function POST(req: NextRequest) {
  try {
    const form: IntakeForm = await req.json()

    // Derive the gate fields from the rich estate questionnaire, then qualify.
    const { qualified, reason } = qualifyLead(deriveGateInput(form))

    // Create lead record (typed columns + JSON bundles for repeating groups).
    const lead = await prisma.lead.create({
      data: buildLeadData(form, { qualified, reason }),
    })

    await auditEvent({
      type: 'LEAD_CREATED',
      leadId: lead.id,
      meta: {
        qualified,
        intakeType: form.intakeType,
        practiceArea: mapPracticeArea(form),
        urgency: mapUrgency(form),
      },
    })

    // If qualified, seed Ghost Assistant sequence
    if (qualified) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const paymentLink = `${appUrl}/payment?leadId=${lead.id}`

      const jobs = await buildSequenceJobsFromTemplates(lead.id, {
        firstName: form.firstName,
        practiceArea: mapPracticeArea(form).replace(/_/g, ' '),
        paymentLink,
      })

      await prisma.sequence.createMany({ data: jobs })
      await auditEvent({ type: 'SEQUENCE_ENQUEUED', leadId: lead.id, meta: { count: jobs.length } })
    }

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      qualified,
      reason,
    })
  } catch (error) {
    console.error('[INTAKE ERROR]', error)
    return NextResponse.json(
      { success: false, error: 'Intake submission failed.' },
      { status: 500 }
    )
  }
}
