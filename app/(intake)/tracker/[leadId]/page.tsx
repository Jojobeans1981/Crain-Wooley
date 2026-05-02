import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import { LeadStatus } from '@prisma/client'
import { CheckCircle2, Clock, Calendar, CreditCard, UserPlus, ClipboardCheck } from 'lucide-react'

interface TrackerPageProps {
  params: {
    leadId: string
  }
}

const STAGES = [
  { id: 'inquiry', label: 'Inquiry Received', icon: ClipboardCheck, statuses: ['NEW'] as LeadStatus[] },
  { id: 'qualification', label: 'Qualification', icon: Clock, statuses: ['QUALIFIED', 'PAYMENT_PENDING'] as LeadStatus[] },
  { id: 'payment', label: 'Consultation Fee Paid', icon: CreditCard, statuses: ['PAYMENT_COMPLETE'] as LeadStatus[] },
  { id: 'scheduled', label: 'Consultation Scheduled', icon: Calendar, statuses: ['SCHEDULED'] as LeadStatus[] },
  { id: 'consulted', label: 'Consultation Complete', icon: CheckCircle2, statuses: ['CONSULTED'] as LeadStatus[] },
  { id: 'hired', label: 'Hired & Onboarding', icon: UserPlus, statuses: ['HIRED'] as LeadStatus[] },
]

export default async function TrackerPage({ params }: TrackerPageProps) {
  const { leadId } = await params
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  })

  if (!lead) {
    notFound()
  }

  const currentStageIndex = STAGES.findIndex(stage => stage.statuses.includes(lead.status))
  const displayStageIndex = currentStageIndex === -1 ? 0 : currentStageIndex

  const getNextStep = () => {
    switch (lead.status) {
      case 'NEW':
        return 'Our team is reviewing your inquiry. We will contact you shortly for qualification.'
      case 'QUALIFIED':
      case 'PAYMENT_PENDING':
        return 'Please complete the consultation fee payment to proceed with scheduling.'
      case 'PAYMENT_COMPLETE':
        return 'Payment received! Please check your email for a link to schedule your consultation.'
      case 'SCHEDULED':
        return `Your consultation is scheduled for ${lead.consultAt?.toLocaleDateString()} at ${lead.consultAt?.toLocaleTimeString()}.`
      case 'CONSULTED':
        return 'Thank you for consulting with us. We are preparing your proposal.'
      case 'HIRED':
        return 'Welcome to Crain & Wooley! Your onboarding process has begun.'
      default:
        return 'Thank you for your interest. We will be in touch.'
    }
  }

  return (
    <div className="min-h-screen bg-vault-void text-vault-parchment px-6 md:px-12 py-10 md:py-16 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 border-b border-vault-border pb-6">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-[2px] h-8 bg-vault-gold" />
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-vault-gold">Client Portal</p>
              <h1 className="font-display text-3xl md:text-4xl font-semibold text-vault-parchment">
                Case Tracker
              </h1>
            </div>
          </div>
          <p className="font-mono text-xs text-vault-steel uppercase tracking-widest">
            Client: {lead.firstName} {lead.lastName.charAt(0)}. | ID: {lead.id}
          </p>
        </header>

        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-[1px] bg-vault-border border border-vault-border">
            {STAGES.map((stage, index) => {
              const isCompleted = index < displayStageIndex
              const isCurrent = index === displayStageIndex
              const Icon = stage.icon

              return (
                <div key={stage.id} className="bg-vault-chamber p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 border flex items-center justify-center ${
                          isCompleted
                            ? 'bg-vault-gold border-vault-gold text-vault-void'
                            : isCurrent
                              ? 'border-vault-gold text-vault-gold'
                              : 'border-vault-border text-vault-border'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-mono text-xs uppercase tracking-widest text-vault-steel">Stage</div>
                        <div className="font-display text-xl font-semibold text-vault-parchment">{stage.label}</div>
                      </div>
                    </div>
                    <div className={`w-2 h-2 ${index <= displayStageIndex ? 'bg-vault-gold' : 'bg-vault-border'}`} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="bg-vault-chamber border border-vault-border p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-[2px] h-8 bg-vault-gold" />
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-vault-gold">Status</p>
              <h2 className="font-display text-2xl font-semibold text-vault-parchment">Next Steps</h2>
            </div>
          </div>
          <p className="text-base font-sans text-vault-parchment leading-relaxed">
            {getNextStep()}
          </p>
          
          {(lead.status === 'QUALIFIED' || lead.status === 'PAYMENT_PENDING') && (
            <div className="mt-8">
              <a
                href={`/payment?leadId=${lead.id}`}
                className="inline-block bg-vault-gold text-vault-void font-mono text-xs font-medium uppercase tracking-widest px-6 py-3 rounded-none hover:bg-vault-goldmute transition-colors mt-6"
              >
                Proceed to Payment
              </a>
            </div>
          )}

          {lead.status === 'PAYMENT_COMPLETE' && (
            <div className="mt-8">
              <a
                href={`/schedule?leadId=${lead.id}`}
                className="inline-block bg-vault-gold text-vault-void font-mono text-xs font-medium uppercase tracking-widest px-6 py-3 rounded-none hover:bg-vault-goldmute transition-colors mt-6"
              >
                Schedule Consultation
              </a>
            </div>
          )}
        </section>

        <footer className="mt-16 border-t border-vault-border pt-6">
          <p className="font-mono text-xs text-vault-steel uppercase tracking-widest">
            Attorney-client privilege notice: do not share sensitive details on unsecured devices.
          </p>
        </footer>
      </div>
    </div>
  )
}
