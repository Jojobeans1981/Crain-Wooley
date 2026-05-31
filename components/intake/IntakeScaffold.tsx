import { cf } from '@/lib/cf'
import { IntakePanel } from './IntakePanel'

/**
 * Split-screen intake shell, ported from the approved intake design
 * (option-counsel-final.jsx · CounselFinalIntake root grid).
 *
 * Left: the sticky dark editorial panel. Right: page content (welcome, the
 * multi-step form, scheduling, payment, confirmation). Collapses to a single
 * column under `md`. The right column is a flex column so pages can pin an
 * action bar to the bottom with `mt-auto`.
 */
export function IntakeScaffold({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="cw-intake-grid"
      style={{ fontFamily: cf.sans, color: cf.text, background: cf.cream }}
    >
      <IntakePanel />
      <main style={{ position: 'relative', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
