export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { qualifyLead } from '@/lib/qualify'
import { buildSequenceJobs } from '@/lib/ghost/sequences'
import type { IntakeFormData } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body: IntakeFormData = await req.json()

    // Run qualification logic
    const { qualified, reason } = qualifyLead(body)

    // Create lead record
    const lead = await prisma.lead.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        practiceArea: body.practiceArea,
        caseType: body.caseType,
        description: body.description,
        urgency: body.urgency,
        qualified,
        disqualifyReason: reason,
        status: qualified ? 'QUALIFIED' : 'DISQUALIFIED',
      },
    })

    // If qualified, seed Ghost Assistant sequence
    if (qualified) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const paymentLink = `${appUrl}/payment?leadId=${lead.id}`

      const jobs = buildSequenceJobs(lead.id, {
        firstName: body.firstName,
        practiceArea: body.practiceArea.replace(/_/g, ' '),
        paymentLink,
      })

      await prisma.sequence.createMany({ data: jobs })
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
