import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLegacyPage, allLegacyPaths } from '@/lib/legacy'
import LegacyArticle from '@/components/legacy/LegacyArticle'

type Params = { slug: string[] }

const toPath = (slug: string[]) => '/' + slug.join('/')

export function generateStaticParams() {
  return allLegacyPaths().map((p) => ({ slug: p.replace(/^\//, '').split('/') }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const page = getLegacyPage(toPath(slug))
  if (!page) return {}
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: toPath(slug) },
  }
}

export default async function LegacyCatchAll({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const path = toPath(slug)
  const page = getLegacyPage(path)
  if (!page) notFound()
  return <LegacyArticle page={page} />
}
