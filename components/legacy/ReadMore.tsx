'use client'

import { useState, type ReactNode } from 'react'

/**
 * Read-more toggle matching the original's behavior (Punch item 1): collapses a long
 * section to a fixed height with a "Continue Reading" control that expands it inline,
 * and "Read Less" to collapse again. Wording/behavior mirror the original
 * (a.btn.v2.rd-mr "Continue Reading" + "Read Less") — not an invented style. Used on
 * /about-us "Working With Our Team", where the original truncates and the clone showed
 * the full text.
 */
export function ReadMore({ children, collapsedHeight = 280 }: { children: ReactNode; collapsedHeight?: number }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`cw-readmore${open ? ' is-open' : ''}`}>
      <div className="cw-readmore-body" style={open ? undefined : { maxHeight: collapsedHeight }}>
        {children}
        {!open && <span className="cw-readmore-fade" aria-hidden="true" />}
      </div>
      <button type="button" className="cw-readmore-toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        {open ? 'Read Less' : 'Continue Reading'}
      </button>
    </div>
  )
}
