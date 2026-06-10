'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Full-bleed Mainstage background video. Autoplays muted/looping like the live
 * site, but honors prefers-reduced-motion: when reduced motion is requested we
 * show the poster frame only and never autoplay. preload="metadata".
 */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null)
  const [reduced, setReduced] = useState(false)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    // One-time sync from an external system (matchMedia) on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduced(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (reduced) { v.pause(); v.removeAttribute('autoplay') }
    else { v.play().then(() => setPlaying(true)).catch(() => {}) }
  }, [reduced])

  function toggle() {
    const v = ref.current
    if (!v) return
    if (v.paused) { v.play().then(() => setPlaying(true)).catch(() => {}) }
    else { v.pause(); setPlaying(false) }
  }

  // Reduced motion → static poster image, no <video> motion at all.
  if (reduced) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img className="cw-hero-media" src="/home/hero-bg.jpg" alt="" aria-hidden="true" />
    )
  }

  return (
    <>
      <video
        ref={ref}
        className="cw-hero-media"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/home/hero-bg.jpg"
        aria-hidden="true"
      >
        <source src="/Mainstage-Video-Final-1.mp4" type="video/mp4" />
      </video>
      {/* WCAG 2.2.2 — visible pause control for auto-playing motion > 5s. */}
      <button
        type="button"
        className="cw-hero-toggle"
        onClick={toggle}
        aria-pressed={!playing}
        aria-label={playing ? 'Pause background video' : 'Play background video'}
      >
        {playing ? (
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" fill="currentColor" /><rect x="14" y="5" width="4" height="14" fill="currentColor" /></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5l12 7-12 7z" fill="currentColor" /></svg>
        )}
      </button>
    </>
  )
}
