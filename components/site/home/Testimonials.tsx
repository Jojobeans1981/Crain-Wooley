'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type Review = { title: string; quote: string; name: string }

/**
 * Testimonials carousel — one review at a time, prev/next + dots, keyboard
 * navigable (ArrowLeft/ArrowRight), auto-advances every 8s. Auto-advance is
 * disabled under prefers-reduced-motion and while the carousel is hovered or
 * focused. All reviews stay in the DOM (aria-hidden toggled) for SR/SEO.
 */
export function Testimonials({ reviews }: { reviews: Review[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  // HOME-2: explicit, always-available pause that doesn't depend on hover/focus.
  const [userPaused, setUserPaused] = useState(false)
  const reducedRef = useRef(false)
  const count = reviews.length

  const go = useCallback((n: number) => setIndex((n + count) % count), [count])
  const next = useCallback(() => go(index + 1), [go, index])
  const prev = useCallback(() => go(index - 1), [go, index])

  useEffect(() => {
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  useEffect(() => {
    if (paused || userPaused || reducedRef.current || count < 2) return
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 8000)
    return () => clearInterval(t)
  }, [paused, userPaused, count])

  return (
    <div
      className="cw-reviews-carousel"
      role="group"
      aria-roledescription="carousel"
      aria-label="Client testimonials"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); next() }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
      }}
      tabIndex={0}
    >
      <div className="cw-reviews-viewport" aria-live="polite">
        {reviews.map((r, i) => (
          <figure
            key={r.title + i}
            className={`cw-review${i === index ? ' cw-review-active' : ''}`}
            aria-hidden={i === index ? undefined : true}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
          >
            <div className="cw-review-stars" aria-label="5 star rating">★★★★★</div>
            <h3 className="cw-review-title">{r.title}</h3>
            <blockquote className="cw-review-quote">{r.quote}</blockquote>
            <figcaption className="cw-review-name">{r.name}</figcaption>
          </figure>
        ))}
      </div>

      <div className="cw-reviews-controls">
        {count > 1 && (
          <button
            type="button"
            className="cw-reviews-arrow"
            aria-label={userPaused ? 'Play testimonial autoplay' : 'Pause testimonial autoplay'}
            aria-pressed={userPaused}
            onClick={() => setUserPaused((p) => !p)}
          >
            {userPaused ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
            )}
          </button>
        )}
        <button type="button" className="cw-reviews-arrow" aria-label="Previous testimonial" onClick={prev}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div className="cw-reviews-dots" role="tablist" aria-label="Choose testimonial">
          {reviews.map((r, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Testimonial ${i + 1}`}
              className={`cw-reviews-dot${i === index ? ' cw-dot-active' : ''}`}
              onClick={() => go(i)}
            />
          ))}
        </div>
        <button type="button" className="cw-reviews-arrow" aria-label="Next testimonial" onClick={next}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>
  )
}
