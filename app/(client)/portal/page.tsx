import Link from 'next/link'
import { PortalAccessForm } from '@/components/site/PortalAccessForm'

export default async function PortalAccessPage({
  searchParams,
}: {
  searchParams?: Promise<{ leadId?: string }>
}) {
  const { leadId } = (await searchParams) ?? {}

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f2e9_0%,#fffdf8_30%,#f2ede3_100%)] text-cw-ink">
      <div className="cw-container py-10 md:py-16">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[1.1fr_.9fr] gap-8 items-start">
          <section className="space-y-6">
            <div className="cw-eyebrow">Client Portal</div>
            <h1 className="font-display text-4xl md:text-5xl text-cw-navy leading-tight">
              Secure document access for ongoing matters.
            </h1>
            <p className="text-base md:text-lg text-cw-ink-soft max-w-2xl">
              Use this portal to open your secure case workspace, review requested documents,
              and send the firm a signature or upload request without exposing your case
              publicly.
            </p>

            <div className="cw-panel-gold p-6">
              <h2 className="font-display text-2xl text-cw-navy">What this portal does</h2>
              <ul className="mt-4 space-y-3 text-sm text-cw-ink-soft">
                <li>- Sends a signed access link to the email already on file.</li>
                <li>- Surfaces intake attachments already captured in the lead record.</li>
                <li>- Lets the client request signature packets or missing documents.</li>
              </ul>
            </div>

            <p className="text-sm text-cw-ink-soft">
              Looking for the public case tracker instead?{' '}
              <Link href="/tracker" className="text-cw-navy underline underline-offset-4">
                Open the tracker
              </Link>
              .
            </p>
          </section>

          <PortalAccessForm leadId={leadId} />
        </div>
      </div>
    </main>
  )
}
