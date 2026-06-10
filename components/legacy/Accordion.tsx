// Collapsed-by-default accordion matching the original's interior plan/FAQ rows.
// Native <details>/<summary> — keyboard-operable, no client JS; CSS handles the
// row, chevron, and divider. Closed on load ("Expand Each Section to Learn More").
export type AccordionItem = { title: string; body: string }

export function Accordion({ items }: { items: AccordionItem[] }) {
  return (
    <div className="cw-accordion">
      {items.map((it, i) => (
        <details key={i} className="cw-accordion-item">
          <summary className="cw-accordion-head">
            <span className="cw-accordion-title">{it.title}</span>
            <svg className="cw-accordion-chev" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </summary>
          <div className="cw-accordion-body">
            {it.body.split(/\n+/).filter(Boolean).map((para, j) => (
              <p key={j}>{para}</p>
            ))}
          </div>
        </details>
      ))}
    </div>
  )
}
