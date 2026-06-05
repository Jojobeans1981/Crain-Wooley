'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createFuse } from '@/lib/search/fuse'
import { TYPE_FILTERS, type FilterKey, type SearchRecord } from '@/lib/search/types'
import { PERSONA_LIST } from '@/lib/learn/personas'
import styles from './SiteSearch.module.css'

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const matchType = (m: SearchRecord, f: FilterKey) => f === 'all' || m.type === f
const matchPersona = (m: SearchRecord, p: string) => !p || (m.personas?.includes(p) ?? false)

/** Wrap query terms (>=2 chars) in <mark> for result highlighting. */
function highlight(text: string, query: string): React.ReactNode {
  const terms = query.trim().split(/\s+/).filter((t) => t.length >= 2).map(escapeRegExp)
  if (!terms.length || !text) return text
  const splitter = new RegExp(`(${terms.join('|')})`, 'ig')
  const test = new RegExp(`^(?:${terms.join('|')})$`, 'i')
  return text.split(splitter).map((part, i) => (test.test(part) ? <mark key={i}>{part}</mark> : part))
}

export function SiteSearch({ initialQuery, initialPersona }: { initialQuery: string; initialPersona: string }) {
  const [query, setQuery] = useState(initialQuery)
  const [debounced, setDebounced] = useState(initialQuery)
  const [filter, setFilter] = useState<FilterKey>('all')
  const [persona, setPersona] = useState(initialPersona)
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

  // Reflect the debounced query + persona in the URL (?q=&persona=) without a navigation.
  useEffect(() => {
    const url = new URL(window.location.href)
    if (debounced.trim()) url.searchParams.set('q', debounced.trim())
    else url.searchParams.delete('q')
    if (persona) url.searchParams.set('persona', persona)
    else url.searchParams.delete('persona')
    window.history.replaceState(null, '', url.toString())
  }, [debounced, persona])

  const fuse = useMemo(() => (records ? createFuse(records) : null), [records])

  const allMatches = useMemo(() => {
    const q = debounced.trim()
    if (!fuse || q.length < 2) return []
    return fuse.search(q).map((r) => r.item)
  }, [fuse, debounced])

  // Type and persona filters AND together. Each chip row's counts are scoped to
  // the OTHER active filter so the numbers reflect what a click would yield.
  const typeCounts = useMemo(() => {
    const scoped = allMatches.filter((m) => matchPersona(m, persona))
    const c: Record<string, number> = { all: scoped.length }
    for (const m of scoped) c[m.type] = (c[m.type] || 0) + 1
    return c
  }, [allMatches, persona])

  const personaCounts = useMemo(() => {
    const scoped = allMatches.filter((m) => matchType(m, filter))
    const c: Record<string, number> = {}
    for (const m of scoped) for (const p of m.personas ?? []) c[p] = (c[p] || 0) + 1
    return c
  }, [allMatches, filter])

  const results = useMemo(
    () => allMatches.filter((m) => matchType(m, filter) && matchPersona(m, persona)),
    [allMatches, filter, persona],
  )

  const hasQuery = debounced.trim().length >= 2
  const personaLabel = persona ? PERSONA_LIST.find((p) => p.path === persona)?.kicker : ''

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
              const n = typeCounts[f.key] || 0
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

        {/* Persona filter — ANDs with the type filter */}
        {hasQuery && allMatches.length > 0 && (
          <div className={styles.filters} role="group" aria-label="Filter results by life stage">
            <span className={styles.filterLabel}>Life stage</span>
            {PERSONA_LIST.map((p) => {
              const n = personaCounts[p.path] || 0
              const active = persona === p.path
              return (
                <button key={p.path} type="button"
                  className={`${styles.chip}${active ? ` ${styles.chipActive}` : ''}`}
                  aria-pressed={active}
                  disabled={n === 0 && !active}
                  onClick={() => setPersona(active ? '' : p.path)}>
                  {p.kicker} <span className={styles.chipN}>{n}</span>
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
                : `${results.length} result${results.length === 1 ? '' : 's'}${filter === 'all' ? '' : ` in ${TYPE_FILTERS.find((f) => f.key === filter)?.label}`}${personaLabel ? ` for ${personaLabel}` : ''} matching “${debounced.trim()}”`}
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
