import Fuse, { type IFuseOptions } from 'fuse.js'
import type { SearchRecord } from './types'

/** Fuzzy-search config: weighted title > headings > keywords > excerpt. */
export const FUSE_OPTIONS: IFuseOptions<SearchRecord> = {
  includeScore: true,
  threshold: 0.38,
  ignoreLocation: true,
  minMatchCharLength: 2,
  keys: [
    { name: 'title', weight: 0.5 },
    { name: 'headings', weight: 0.25 },
    { name: 'keywords', weight: 0.15 },
    { name: 'excerpt', weight: 0.1 },
  ],
}

export function createFuse(records: SearchRecord[]): Fuse<SearchRecord> {
  return new Fuse(records, FUSE_OPTIONS)
}
