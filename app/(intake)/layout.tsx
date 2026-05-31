export default function IntakeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'transparent',
        minHeight: '100vh',
        position: 'relative',
      }}
    >
      {/* Very faint scales-of-justice watermark, centered and pinned. */}
      <svg
        viewBox="0 0 260 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(560px, 55vw)',
          height: 'min(560px, 55vw)',
          opacity: 0.025,
          pointerEvents: 'none',
          color: '#2E414F',
          zIndex: 0,
        }}
      >
        <circle cx="130" cy="30" r="6" stroke="currentColor" strokeWidth="1.8" />
        <line x1="130" y1="36" x2="130" y2="240" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="86" y1="240" x2="174" y2="240" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="72" y1="254" x2="188" y2="254" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="88" y1="240" x2="88" y2="254" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="172" y1="240" x2="172" y2="254" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="20" y1="72" x2="240" y2="72" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="20" cy="72" r="4" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="240" cy="72" r="4" stroke="currentColor" strokeWidth="1.6" />
        <path d="M130 60 L137 72 L130 84 L123 72 Z" stroke="currentColor" strokeWidth="1.2" />
        <line x1="20" y1="76" x2="20" y2="148" stroke="currentColor" strokeWidth="1.2" strokeDasharray="5 3" strokeLinecap="round" />
        <line x1="240" y1="76" x2="240" y2="148" stroke="currentColor" strokeWidth="1.2" strokeDasharray="5 3" strokeLinecap="round" />
        <line x1="-4" y1="148" x2="44" y2="148" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M -4 148 Q 20 174 44 148" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="216" y1="148" x2="264" y2="148" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M 216 148 Q 240 174 264 148" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="130" cy="50" r="8" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
      </svg>

      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>

      {/* Reveal-on-scroll observer — adds .in to .reveal / .reveal-stagger when 25% visible */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(){
              if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
              var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
              if (reduce) {
                document.querySelectorAll('.reveal, .reveal-stagger').forEach(function(el){ el.classList.add('in'); });
                return;
              }
              var io = new IntersectionObserver(function(entries){
                entries.forEach(function(e){
                  if (e.isIntersecting) {
                    e.target.classList.add('in');
                    io.unobserve(e.target);
                  }
                });
              }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
              function bind(){
                document.querySelectorAll('.reveal:not(.in), .reveal-stagger:not(.in)').forEach(function(el){ io.observe(el); });
              }
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', bind);
              } else {
                bind();
              }
            })();
          `,
        }}
      />
    </div>
  )
}
