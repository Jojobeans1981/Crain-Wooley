import type { MetadataRoute } from 'next'
import { PILLAR_SLUGS } from '@/lib/learn/pillars'
import { allLegacyPaths } from '@/lib/legacy'

/**
 * XML sitemap for the canonical production host: the public entry points, the
 * Learning Center, and every migrated legacy page served by the catch-all.
 * As the crawl completes, more legacy pages appear here automatically.
 */
const SITE = 'https://www.estateplanningdfw.law'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticRoutes = [
    '/',
    '/qualify',
    '/learn',
    '/learn/quizzes/do-you-need-a-trust',
    '/learn/quizzes/do-you-need-probate',
    '/learn/quizzes/which-plan-do-i-need',
  ]
  const pillars = PILLAR_SLUGS.map((s) => `/learn/${s}`)
  const legacy = allLegacyPaths()

  const all = [...new Set([...staticRoutes, ...pillars, ...legacy])]

  return all.map((path) => ({
    url: `${SITE}${path}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: path === '/' ? 1 : path.startsWith('/learn') ? 0.7 : 0.8,
  }))
}
