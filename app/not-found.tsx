import Link from 'next/link'

// Root 404 — renders under the root layout (no marketing chrome), so it is
// styled self-contained with the cw tokens. Keeps users on-brand instead of the
// unstyled Next default.
export default function NotFound() {
  return (
    <main
      id="main"
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '80px 24px',
        background: '#faf5ea',
        color: '#343434',
      }}
    >
      <p style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.18em', textTransform: 'uppercase', fontSize: 13, color: '#7A6444', margin: '0 0 14px' }}>
        Error 404
      </p>
      <h1 style={{ fontFamily: 'var(--font-display-fallback)', fontWeight: 400, fontSize: 'clamp(38px, 6vw, 60px)', lineHeight: 1.1, margin: '0 0 16px' }}>
        This page can&rsquo;t be found
      </h1>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 17, lineHeight: 1.8, maxWidth: 520, margin: '0 0 30px' }}>
        The page you&rsquo;re looking for may have moved. Let&rsquo;s get you back to planning with
        confidence.
      </p>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/"
          style={{ background: '#304451', color: '#fff', padding: '14px 26px', fontFamily: 'var(--font-sans)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 13, textDecoration: 'none' }}
        >
          Back to Home
        </Link>
        <Link
          href="/contact-us/"
          style={{ border: '1px solid #304451', color: '#304451', padding: '14px 26px', fontFamily: 'var(--font-sans)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 13, textDecoration: 'none' }}
        >
          Contact Us
        </Link>
      </div>
    </main>
  )
}
