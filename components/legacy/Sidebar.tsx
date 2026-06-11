import type { SidebarBlock } from '@/lib/legacy/family-b'

/**
 * Geo/practice interior LEFT sidebar — a stack of navy boxes per the baseline:
 *  - nav (Staff Profiles): white serif heading + uppercase, letter-spaced staff
 *    links with dashed dividers.
 *  - cta (Download Guide / location boxes): serif heading + gold button(s).
 * Rendered from the structured `sd-zn` records; links render as-is.
 */
export function Sidebar({ blocks }: { blocks: SidebarBlock[] }) {
  return (
    <div className="cw-sd">
      {blocks.map((b, i) => (
        <section key={i} className={`cw-sd-box cw-sd-${b.kind}`}>
          {b.heading && <h3 className="cw-sd-heading">{b.heading}</h3>}
          {b.kind === 'nav' ? (
            <ul className="cw-sd-navlinks">
              {b.links.map((l, j) => (
                <li key={j}><a href={l.href}>{l.text}</a></li>
              ))}
            </ul>
          ) : (
            <div className="cw-sd-actions">
              {b.links.map((l, j) => (
                <a
                  key={j}
                  href={l.href}
                  className="cw-btn-gold cw-sd-btn"
                  {...(/^https?:/.test(l.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {l.text}
                </a>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
