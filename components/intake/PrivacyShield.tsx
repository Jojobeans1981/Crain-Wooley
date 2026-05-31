// Tiny shield glyph for the confidential-intake footers.
// Ported verbatim from the approved intake design (intake-shared.jsx · PrivacyShield).

export function PrivacyShield({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1.5L2.5 3.5v4.2c0 3.2 2.3 5.9 5.5 6.8 3.2-.9 5.5-3.6 5.5-6.8V3.5L8 1.5z"
        stroke={color}
        strokeWidth="1.1"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M5.5 8.2l1.7 1.7L10.5 6.6"
        stroke={color}
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
