import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db/prisma'
import { verifyPortalToken } from '@/lib/portal/token'
import { getPortalChecklist } from '@/lib/portal/checklist'
import { readPortalAttachmentState } from '@/lib/portal/attachments'
import { signPortalObjectUrl } from '@/lib/portal/storage'
import { PortalRequestForm } from '@/components/site/PortalRequestForm'
import { PortalUploadForm } from '@/components/site/PortalUploadForm'

function formatLegacyAttachments(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return []
  return Object.entries(value as Record<string, unknown>)
    .filter(([, raw]) => raw && !Array.isArray(raw) && typeof raw !== 'object')
    .map(([key, raw]) => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())
      return { key, label, value: String(raw) }
    })
}

function formatReadableDate(value: string) {
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

export default async function ClientPortalPage({
  params,
}: {
  params: Promise<{ leadId: string; token: string }>
}) {
  const { leadId, token } = await params
  const claims = verifyPortalToken(token)
  if (!claims || claims.leadId !== leadId) notFound()

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      status: true,
      practiceArea: true,
      intakeType: true,
      consultAt: true,
      description: true,
      attachments: true,
      hasChildren: true,
      hasMinorChildren: true,
      ownsRealEstate: true,
      ownsBusiness: true,
      decedentName: true,
      willExists: true,
      decedentHadTrust: true,
      createdAt: true,
    },
  })

  if (!lead || lead.email.toLowerCase() !== claims.email) notFound()

  const checklist = getPortalChecklist(lead)
  const portalState = readPortalAttachmentState(lead.attachments)
  const uploads = await Promise.all(
    portalState.portalUploads.map(async (upload) => ({
      ...upload,
      signedUrl: await signPortalObjectUrl({ bucket: upload.bucket, path: upload.path, expiresIn: 60 * 60 }),
    }))
  )
  const legacyAttachments = formatLegacyAttachments(lead.attachments)

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f2e9_0%,#fffdf8_24%,#f3ede0_100%)] text-cw-ink">
      <div className="cw-container py-10 md:py-16">
        <div className="max-w-6xl mx-auto space-y-8">
          <header className="cw-panel p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="cw-eyebrow">Secure Client Portal</div>
                <h1 className="font-display text-3xl md:text-4xl text-cw-navy mt-2">
                  {lead.firstName} {lead.lastName}
                </h1>
                <p className="text-sm text-cw-ink-soft mt-2 max-w-2xl">
                  This workspace stays private and only loads because the link was signed for
                  {` ${claims.email}`}. Use it to review the case, see what the firm has
                  already received, and send new requests.
                </p>
              </div>

              <div className="cw-panel-gold p-4 min-w-[260px]">
                <div className="text-[11px] uppercase tracking-widest font-semibold text-cw-ink-mute">
                  Current status
                </div>
                <div className="font-display text-2xl text-cw-navy mt-1">
                  {lead.status.replace(/_/g, ' ')}
                </div>
                <div className="text-sm text-cw-ink-soft mt-2">
                  Lead ID: <span className="font-mono">{lead.id}</span>
                </div>
              </div>
            </div>
          </header>

          <section className="grid lg:grid-cols-[1.1fr_.9fr] gap-8">
            <div className="space-y-8">
              <div className="cw-panel p-6 md:p-7">
                <div className="cw-eyebrow mb-3">Next Step</div>
                <p className="text-base text-cw-ink-soft leading-relaxed">
                  {lead.status === 'NEW' && 'The team is reviewing your inquiry and will respond shortly.'}
                  {lead.status === 'QUALIFIED' && 'Your consultation fee is ready to be completed before scheduling.'}
                  {lead.status === 'PAYMENT_PENDING' && 'Please finish payment so the calendar step can open.'}
                  {lead.status === 'PAYMENT_COMPLETE' && 'You can schedule the consultation once the calendar link is issued.'}
                  {lead.status === 'SCHEDULED' && `Your consultation is scheduled${lead.consultAt ? ` for ${lead.consultAt.toLocaleString()}` : ''}.`}
                  {lead.status === 'CONSULTED' && 'The firm is preparing the engagement and onboarding materials.'}
                  {lead.status === 'HIRED' && 'Your matter is active and the client team will coordinate the document workflow.'}
                  {lead.status === 'DISQUALIFIED' && 'The team marked the lead as not moving forward at this time.'}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  {lead.status === 'QUALIFIED' || lead.status === 'PAYMENT_PENDING' ? (
                    <Link href={`/payment?leadId=${lead.id}`} className="cw-btn-primary">
                      Complete Payment
                    </Link>
                  ) : null}
                  {lead.status === 'PAYMENT_COMPLETE' ? (
                    <Link href={`/schedule?leadId=${lead.id}`} className="cw-btn-primary">
                      Schedule Consultation
                    </Link>
                  ) : null}
                  <a href={`mailto:${lead.email}`} className="cw-btn-secondary">
                    Email the firm
                  </a>
                </div>
              </div>

              <div className="cw-panel p-6 md:p-7">
                <div className="cw-eyebrow mb-4">Document Checklist</div>
                <div className="grid md:grid-cols-2 gap-4">
                  {checklist.map((item) => (
                    <article key={item.id} className="border border-cw-line bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display text-lg text-cw-navy">{item.title}</h3>
                        <span className="text-[10px] uppercase tracking-widest font-semibold text-cw-ink-mute">
                          {item.audience}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-cw-ink-soft leading-relaxed">{item.description}</p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <PortalUploadForm leadId={lead.id} token={token} />
                <PortalRequestForm leadId={lead.id} token={token} />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="cw-panel p-6 md:p-7">
                  <div className="cw-eyebrow mb-4">Uploaded Files</div>
                  {uploads.length ? (
                    <ul className="space-y-3">
                      {uploads.map((upload) => (
                        <li key={upload.id} className="border border-cw-line bg-white px-4 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-cw-navy">{upload.name}</div>
                              <div className="text-xs text-cw-ink-soft mt-1">
                                {formatReadableDate(upload.uploadedAt)} · {(upload.size / 1024).toFixed(1)} KB
                              </div>
                            </div>
                            {upload.signedUrl ? (
                              <a href={upload.signedUrl} className="text-xs text-cw-gold font-semibold">
                                Download
                              </a>
                            ) : (
                              <span className="text-xs text-cw-ink-mute">Storage offline</span>
                            )}
                          </div>
                          {upload.note && <div className="mt-2 text-xs text-cw-ink-soft">{upload.note}</div>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-cw-ink-soft">
                      No portal uploads have been stored yet.
                    </p>
                  )}
                </div>

                <div className="cw-panel p-6 md:p-7">
                  <div className="cw-eyebrow mb-4">What we already have</div>
                  {legacyAttachments.length ? (
                    <ul className="space-y-3">
                      {legacyAttachments.map((attachment) => (
                        <li key={attachment.key} className="border border-cw-line bg-white px-4 py-3">
                          <div className="text-sm font-semibold text-cw-navy">{attachment.label}</div>
                          <div className="text-xs text-cw-ink-soft mt-1 break-all">{attachment.value}</div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-cw-ink-soft">
                      No intake attachments are stored on this lead yet.
                    </p>
                  )}

                  <div className="mt-5 border-t border-cw-line pt-4 text-sm text-cw-ink-soft">
                    Started on {lead.createdAt.toLocaleDateString()}.
                  </div>
                </div>
              </div>

              <div className="cw-panel p-6 md:p-7">
                <div className="cw-eyebrow mb-4">Request history</div>
                {portalState.portalRequests.length ? (
                  <ul className="space-y-3">
                    {portalState.portalRequests.map((request) => (
                      <li key={request.id} className="border border-cw-line bg-white px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-cw-navy">
                              {request.kind === 'SIGNATURE' ? 'Signature packet' : 'Document request'}
                            </div>
                            <div className="text-xs text-cw-ink-soft mt-1">
                              {formatReadableDate(request.createdAt)}
                            </div>
                          </div>
                          <span className="text-[10px] uppercase tracking-widest font-semibold text-cw-ink-mute">
                            Logged
                          </span>
                        </div>
                        {request.note && <div className="mt-2 text-xs text-cw-ink-soft">{request.note}</div>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-cw-ink-soft">
                    No document requests have been logged yet.
                  </p>
                )}
              </div>
            </div>

            <aside className="space-y-6">
              <div className="cw-panel-gold p-6">
                <div className="cw-eyebrow mb-3">Portal Notes</div>
                <ul className="space-y-3 text-sm text-cw-ink-soft">
                  <li>- This link expires automatically and is signed for your email address.</li>
                  <li>- The firm can use your requests to start the next document workflow.</li>
                  <li>- Please do not forward this link to anyone outside your household or team.</li>
                </ul>
              </div>

              <div className="cw-panel p-6">
                <div className="cw-eyebrow mb-3">Case Snapshot</div>
                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="text-[11px] uppercase tracking-widest text-cw-ink-mute font-semibold">Practice area</dt>
                    <dd className="mt-1 text-cw-navy">{lead.practiceArea.replace(/_/g, ' ')}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-widest text-cw-ink-mute font-semibold">Email</dt>
                    <dd className="mt-1 text-cw-navy break-all">{lead.email}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-widest text-cw-ink-mute font-semibold">Phone</dt>
                    <dd className="mt-1 text-cw-navy">{lead.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-widest text-cw-ink-mute font-semibold">Lead type</dt>
                    <dd className="mt-1 text-cw-navy">{lead.intakeType?.replace(/_/g, ' ') ?? 'N/A'}</dd>
                  </div>
                </dl>
              </div>

              <div className="cw-panel p-6">
                <div className="cw-eyebrow mb-3">Need help?</div>
                <p className="text-sm text-cw-ink-soft">
                  If the link does not open or you need a refreshed access email, return to the
                  portal page and request a new secure link.
                </p>
                <div className="mt-4">
                  <Link href="/portal" className="cw-btn-secondary inline-flex">
                    Request a fresh link
                  </Link>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </div>
    </main>
  )
}
