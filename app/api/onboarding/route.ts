export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { ClioService } from '@/lib/clio/ClioService'
import { sendPortalAccessEmail } from '@/lib/portal/notify'

export async function POST(req: NextRequest) {
  try {
    const { leadId } = await req.json()

    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    if (lead.status !== 'CONSULTED') {
      return NextResponse.json(
        { error: 'Lead must be in CONSULTED status to trigger onboarding' },
        { status: 400 }
      )
    }

    // 1. Get or Create Clio Contact
    let contactId = lead.clioContactId
    
    if (!contactId) {
      const existing = await ClioService.getContactByEmail(lead.email)
      if (existing) {
        contactId = existing.id
      } else {
        const contact = await ClioService.createContact({
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          phone: lead.phone,
        })
        contactId = contact.id
      }
    }

    // 2. Create Clio Matter
    const matter = await ClioService.createMatter({
      contactId: contactId,
      description: lead.description,
      practiceArea: lead.practiceArea,
    })

    // 3. Fire onboarding task template
    await ClioService.triggerOnboardingTemplate(matter.id)

    // 4. Seed intake tasks
    const dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    await ClioService.createTask({
      matterId: matter.id,
      name: 'Send retainer agreement',
      dueAt: dueDate,
    })
    await ClioService.createTask({
      matterId: matter.id,
      name: 'Request initial documents from client',
      dueAt: dueDate,
    })
    await ClioService.createTask({
      matterId: matter.id,
      name: 'Assign lead attorney',
      dueAt: dueDate,
    })

    // 5. Update lead record
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: 'HIRED',
        hired: true,
        hiredAt: new Date(),
        clioContactId: contactId,
        clioMatterId: matter.id,
      },
    })

    await sendPortalAccessEmail(leadId, 'onboarding-started').catch((error) => {
      console.error('[ONBOARDING] portal email failed', error)
    })

    return NextResponse.json({
      success: true,
      clioContactId: contactId,
      clioMatterId: matter.id,
    })
  } catch (error) {
    console.error('[ONBOARDING ERROR]', error)
    return NextResponse.json({ error: 'Onboarding trigger failed' }, { status: 500 })
  }
}
