import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding demo data...')

  // Clean existing demo leads (keep real ones if any, but usually we clear for demo)
  // await prisma.lead.deleteMany({})

  const now = new Date()

  const leads = [
    {
      firstName: 'Sarah',
      lastName: 'Connor',
      email: 'sarah@skynet.com',
      phone: '(555) 123-4567',
      practiceArea: 'ESTATE_PLANNING',
      caseType: 'Living Trust',
      description: 'Need to protect my son and ensure assets are handled correctly in case of... termination.',
      urgency: 'IMMEDIATE',
      status: 'HIRED',
      paymentStatus: 'PAID',
      hired: true,
      hiredAt: new Date(now.getTime() - 86400000 * 2),
      createdAt: new Date(now.getTime() - 86400000 * 5),
      clioContactId: 'demo_contact_1',
      clioMatterId: 'demo_matter_1',
    },
    {
      firstName: 'Bruce',
      lastName: 'Wayne',
      email: 'bruce@waynecorp.com',
      phone: '(555) 999-0000',
      practiceArea: 'BUSINESS_LAW',
      caseType: 'Mergers & Acquisitions',
      description: 'Acquiring a tech startup. Need contract review and compliance check.',
      urgency: 'WITHIN_WEEK',
      status: 'SCHEDULED',
      paymentStatus: 'PAID',
      consultAt: new Date(now.getTime() + 86400000),
      createdAt: new Date(now.getTime() - 86400000 * 3),
    },
    {
      firstName: 'Peter',
      lastName: 'Parker',
      email: 'peter@dailybugle.com',
      phone: '(555) 111-2222',
      practiceArea: 'PERSONAL_INJURY',
      caseType: 'Workplace Injury',
      description: 'Bit by a radioactive spider at a lab. Not sure who is liable.',
      urgency: 'WITHIN_MONTH',
      status: 'PAYMENT_COMPLETE',
      paymentStatus: 'PAID',
      createdAt: new Date(now.getTime() - 86400000),
    },
    {
      firstName: 'Walter',
      lastName: 'White',
      email: 'heisenberg@blue.com',
      phone: '(555) 555-5555',
      practiceArea: 'CRIMINAL_DEFENSE',
      caseType: 'Money Laundering',
      description: 'I need a... criminal lawyer. Urgent situation with business partners.',
      urgency: 'IMMEDIATE',
      status: 'PAYMENT_PENDING',
      paymentStatus: 'UNPAID',
      createdAt: new Date(now.getTime() - 3600000 * 2),
    },
    {
      firstName: 'Michael',
      lastName: 'Scott',
      email: 'm.scott@dundermifflin.com',
      phone: '(555) 222-3333',
      practiceArea: 'REAL_ESTATE',
      caseType: 'Condo Purchase',
      description: 'I declare BANKRUPTCY! Just kidding, I just want to buy a condo.',
      urgency: 'RESEARCHING',
      status: 'DISQUALIFIED',
      disqualifyReason: 'Lead is in research phase — no immediate legal need identified.',
      createdAt: new Date(now.getTime() - 3600000 * 12),
    }
  ]

  for (const lead of leads) {
    await prisma.lead.upsert({
      where: { email: lead.email },
      update: lead as any,
      create: lead as any,
    })
  }

  console.log('✅ Demo data seeded successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
