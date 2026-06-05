import Link from 'next/link'

/**
 * Shared public-site header/footer + scroll-reveal, used by the Learning Center
 * layout and the marketing (legacy-page) layout. Warm-editorial design system.
 */

export function SiteHeader() {
  return (
    <header className="cw-header sticky top-0 z-40">
      <div className="cw-container flex items-center justify-between h-[68px] gap-5">
        <Link href="/" className="font-display text-[21px] font-bold text-cw-ink no-underline tracking-[-0.01em]">
          Crain <span className="text-cw-gold">&amp;</span> Wooley
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-7">
          <Link href="/estate-planning/trusts" className="hidden md:inline text-cw-ink-soft hover:text-cw-gold text-[14.5px] font-medium no-underline">Estate Planning</Link>
          <Link href="/probate" className="hidden md:inline text-cw-ink-soft hover:text-cw-gold text-[14.5px] font-medium no-underline">Probate</Link>
          <Link href="/learn" className="hidden md:inline text-cw-ink-soft hover:text-cw-gold text-[14.5px] font-medium no-underline">Learn</Link>
          <Link href="/qualify" className="cw-btn-primary">Book a Consultation</Link>
        </nav>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="cw-header border-t border-cw-line mt-16">
      <div className="cw-container py-9 text-cw-ink-mute text-[14px]">
        Crain &amp; Wooley · Estate Planning Attorneys · Plano · Mansfield · Fort Worth ·{' '}
        <a href="tel:9729451610" className="text-cw-ink-soft">(972) 945-1610</a>
        <p className="mt-3 text-[12.5px] text-cw-ink-mute max-w-2xl">
          The information on this website is for general information purposes only and is not legal advice.
          Viewing it does not create an attorney-client relationship.
        </p>
      </div>
    </footer>
  )
}

export function RevealScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){if(typeof window==='undefined'||!('IntersectionObserver'in window))return;var r=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(r){document.querySelectorAll('.reveal').forEach(function(e){e.classList.add('in')});return;}var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}})},{threshold:0.18,rootMargin:'0px 0px -8% 0px'});function b(){document.querySelectorAll('.reveal:not(.in)').forEach(function(e){io.observe(e)})}if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',b)}else{b()}})();`,
      }}
    />
  )
}
