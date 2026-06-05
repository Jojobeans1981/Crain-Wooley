export type ResultType = 'page' | 'blog' | 'learn' | 'quiz'

/** One slim record in public/search-index.json (full body intentionally dropped). */
export interface SearchRecord {
  url: string
  title: string
  type: ResultType
  section: string
  headings: string
  excerpt: string
  keywords: string
}

export type FilterKey = 'all' | ResultType

export const TYPE_FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'learn', label: 'Guides' },
  { key: 'blog', label: 'Blog' },
  { key: 'quiz', label: 'Quizzes' },
  { key: 'page', label: 'Pages' },
]
