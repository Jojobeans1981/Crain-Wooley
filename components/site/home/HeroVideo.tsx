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
    else { v.play().catch(() => {}) }
  }, [reduced])

  // Reduced motion → static poster image, no <video> motion at all.
  if (reduced) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img className="cw-hero-media" src="/home/hero-bg.jpg" alt="" aria-hidden="true" />
    )
  }

  return (
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
  )
}
