'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createFuse } from '@/lib/search/fuse'
import { TYPE_FILTERS, type FilterKey, type SearchRecord } from '@/lib/search/types'
import styles from './SiteSearch.module.css'

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Wrap query terms (>=2 chars) in <mark> for result highlighting. */
function highlight(text: string, query: string): React.ReactNode {
  const terms = query.trim().split(/\s+/).filter((t) => t.length >= 2).map(escapeRegExp)
  if (!terms.length || !text) return text
  const splitter = new RegExp(`(${terms.join('|')})`, 'ig')
  const test = new RegExp(`^(?:${terms.join('|')})$`, 'i')
  return text.split(splitter).map((part, i) => (test.test(part) ? <mark key={i}>{part}</mark> : part))
}

export function SiteSearch({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery)
  const [debounced, setDebounced] = useState(initialQuery)
  const [filter, setFilter] = useState<FilterKey>('all')
  const [records, setRecords] = useState<SearchRecord[] | null>(null)
  const [failed, setFailed] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load the slim index once.
  useEffect(() => {
    let alive = true
    fetch('/search-index.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: SearchRecord[]) => { if (alive) setRecords(data) })
      .catch(() => { if (alive) setFailed(true) })
    return () => { alive = false }
  }, [])

  // Debounce the query.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 180)
    return () => clearTimeout(t)
  }, [query])

  // Reflect the debounced query in the URL (?q=) without a navigation.
  useEffect(() => {
    const url = new URL(window.location.href)
    if (debounced.trim()) url.searchParams.set('q', debounced.trim())
    else url.searchParams.delete('q')
    window.history.replaceState(null, '', url.toString())
  }, [debounced])

  const fuse = useMemo(() => (records ? createFuse(records) : null), [records])

  const allMatches = useMemo(() => {
    const q = debounced.trim()
    if (!fuse || q.length < 2) return []
    return fuse.search(q).map((r) => r.item)
  }, [fuse, debounced])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: allMatches.length }
    for (const m of allMatches) c[m.type] = (c[m.type] || 0) + 1
    return c
  }, [allMatches])

  const results = useMemo(
    () => (filter === 'all' ? allMatches : allMatches.filter((m) => m.type === filter)),
    [allMatches, filter],
  )

  const hasQuery = debounced.trim().length >= 2

  return (
    <div className="cw-article-bg">
      <header className="legacy-banner">
        <div className="cw-container legacy-banner-inner">
          <h1 className="legacy-banner-title">Search</h1>
        </div>
      </header>

      <div className={`cw-container ${styles.search}`}>
        <form role="search" className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="cw-search-input" className={styles.label}>Search the site</label>
          <div className={styles.field}>
            <svg className={styles.icon} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              id="cw-search-input"
              ref={inputRef}
              type="search"
              autoComplete="off"
              placeholder="Try “trust”, “probate”, “power of attorney”…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={styles.input}
              aria-describedby="cw-search-count"
            />
            {query && (
              <button type="button" className={styles.clear} aria-label="Clear search"
                onClick={() => { setQuery(''); inputRef.current?.focus() }}>
                &times;
              </button>
            )}
          </div>
        </form>

        {/* Type filter */}
        {hasQuery && allMatches.length > 0 && (
          <div className={styles.filters} role="group" aria-label="Filter results by type">
            {TYPE_FILTERS.map((f) => {
              const n = counts[f.key] || 0
              if (f.key !== 'all' && n === 0) return null
              return (
                <button key={f.key} type="button"
                  className={`${styles.chip}${filter === f.key ? ` ${styles.chipActive}` : ''}`}
                  aria-pressed={filter === f.key}
                  onClick={() => setFilter(f.key)}>
                  {f.label} <span className={styles.chipN}>{n}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Result count — live region */}
        <p id="cw-search-count" className={styles.count} aria-live="polite">
          {failed
            ? 'Search is unavailable right now. Please try again.'
            : !hasQuery
              ? ''
              : records === null
                ? 'Searching…'
                : `${results.length} result${results.length === 1 ? '' : 's'}${filter === 'all' ? '' : ` in ${TYPE_FILTERS.find((f) => f.key === filter)?.label}`} for “${debounced.trim()}”`}
        </p>

        {/* Results / states */}
        {!hasQuery ? (
          <p className={styles.empty}>
            Search across guides, blog posts, and pages — wills, trusts, probate, powers of attorney, and more.
          </p>
        ) : results.length === 0 && records !== null && !failed ? (
          <p className={styles.empty}>
            No results for “{debounced.trim()}”. Try a broader term, or browse the{' '}
            <Link href="/learn">Learning Center</Link>.
          </p>
        ) : (
          <ul className={styles.results}>
            {results.map((r) => (
              <li key={r.url}>
                <Link href={r.url} className={styles.result}>
                  <span className={styles.resultSection}>{r.section}</span>
                  <span className={styles.resultTitle}>{highlight(r.title, debounced)}</span>
                  {r.excerpt && <span className={styles.resultExcerpt}>{highlight(r.excerpt, debounced)}</span>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
