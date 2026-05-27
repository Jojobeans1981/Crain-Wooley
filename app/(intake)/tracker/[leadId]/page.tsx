import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db/prisma'
import { LeadStatus } from '@prisma/client'
import { CheckCircle2, Clock, Calendar, CreditCard, UserPlus, ClipboardCheck } from 'lucide-react'

// NOTE: All server logic, Prisma queries, status routing, and stage detection
// below is UNCHANGED. Only presentation has been restyled to match the new brand.

interface TrackerPageProps {
  params: Promise<{
    leadId: string
  }>
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
    <div className="min-h-screen text-cw-ink font-sans"><div className="cw-shell">
      {/* Header */}
      <header className="cw-header">
        <div className="cw-container py-5 flex items-center justify-between">
          <Link href="/" className="no-underline flex items-center gap-3" aria-label="Crain & Wooley — Home">
            <span role="img" aria-label="Crain & Wooley" className="cw-emblem" />
          </Link>
          <a
            href="tel:9729451610"
            className="inline-flex items-center text-cw-navy font-semibold text-sm hover:text-cw-gold transition-colors"
          >
            <span className="text-cw-gold">☎</span> (972) 945-1610
          </a>
        </div>
      </header>

      <div className="cw-container py-10 md:py-16">
        <div className="max-w-5xl mx-auto">
          {/* Title block */}
          <header className="mb-12 pb-6 border-b border-cw-line">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-[3px] h-10 bg-cw-gold" />
              <div>
                <p className="cw-eyebrow">Client Portal</p>
                <h1 className="font-display text-3xl md:text-4xl font-semibold text-cw-navy mt-1">
                  Case Tracker
                </h1>
              </div>
            </div>
            <p className="text-sm text-cw-ink-soft">
              <span className="font-semibold text-cw-navy">Client:</span>{' '}
              {lead.firstName} {lead.lastName.charAt(0)}.{' '}
              <span className="text-cw-ink-mute mx-2">|</span>{' '}
              <span className="font-semibold text-cw-navy">ID:</span>{' '}
              <span className="font-mono text-xs">{lead.id}</span>
            </p>
          </header>

          {/* Stages */}
          <section className="mb-16">
            <p className="cw-eyebrow mb-5">Progress</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {STAGES.map((stage, index) => {
                const isCompleted = index < displayStageIndex
                const isCurrent = index === displayStageIndex
                const Icon = stage.icon

                return (
                  <div
                    key={stage.id}
                    className={`cw-panel p-6 transition-all ${
                      isCurrent ? 'border-cw-gold !border-t-[3px]' : ''
                    } ${!isCompleted && !isCurrent ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-11 h-11 rounded border flex items-center justify-center shrink-0 ${
                            isCompleted
                              ? 'bg-cw-gold border-cw-gold text-white'
                              : isCurrent
                                ? 'border-cw-gold text-cw-gold bg-cw-gold/[0.08]'
                                : 'border-cw-line text-cw-ink-mute bg-white'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] uppercase tracking-widest text-cw-ink-mute font-semibold">
                            Stage {String(index + 1).padStart(2, '0')}
                          </div>
                          <div className="font-display text-lg font-semibold text-cw-navy leading-tight mt-0.5">
                            {stage.label}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 mt-2 ${
                          index <= displayStageIndex ? 'bg-cw-gold' : 'bg-cw-line'
                        }`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Next steps */}
          <section className="cw-panel-gold p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-[3px] h-10 bg-cw-gold" />
              <div>
                <p className="cw-eyebrow">Status</p>
                <h2 className="font-display text-2xl font-semibold text-cw-navy mt-1">
                  Next Steps
                </h2>
              </div>
            </div>
            <p className="text-base text-cw-ink leading-relaxed">{getNextStep()}</p>

            {(lead.status === 'QUALIFIED' || lead.status === 'PAYMENT_PENDING') && (
              <div className="mt-8">
                <a href={`/payment?leadId=${lead.id}`} className="cw-btn-primary inline-block">
                  Proceed to Payment
                </a>
              </div>
            )}

            {lead.status === 'PAYMENT_COMPLETE' && (
              <div className="mt-8">
                <a href={`/schedule?leadId=${lead.id}`} className="cw-btn-primary inline-block">
                  Schedule Consultation
                </a>
              </div>
            )}
          </section>

          {/* Footer */}
          <footer className="mt-16 pt-6 border-t border-cw-line">
            <p className="text-xs text-cw-ink-mute">
              <span className="font-semibold">Attorney-client privilege notice:</span> Do not
              share sensitive details on unsecured devices.
            </p>
          </footer>
        </div>
      </div>
      </div>
    </div>
  )
}
