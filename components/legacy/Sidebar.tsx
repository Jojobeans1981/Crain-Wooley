import type { SidebarBlock } from '@/lib/legacy/family-b'

/**
 * Interior sidebar (the original's `sd-zn three-8ths` right rail): sibling-page
 * nav (`sd-nv`), CTA cards (`sd-cta`, e.g. the download-guide), and office /
 * contact blocks. Rendered from the structured records; links render as-is
 * (relative paths resolve on the clone now and after cutover).
 */
export function Sidebar({ blocks }: { blocks: SidebarBlock[] }) {
  return (
    <div className="cw-sd">
      {blocks.map((b, i) => (
        <section key={i} className={`cw-sd-block cw-sd-${b.kind}`}>
          {b.heading && <h3 className="cw-sd-heading">{b.heading}</h3>}
          {b.links.length > 0 && (
            <ul className="cw-sd-links">
              {b.links.map((l, j) => (
                <li key={j}>
                  <a href={l.href}>{l.text}</a>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}
