import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getArticle, getArticleSlugs } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'
import { getContentImageUrl } from '@/lib/content-image'
import ContentImage from '@/components/ui/ContentImage'
import ArticleBody from '@/components/learning/ArticleBody'
import ArticleCard from '@/components/learning/ArticleCard'
import Badge from '@/components/ui/Badge'
import SectionLabel from '@/components/ui/SectionLabel'

export const revalidate = 60
type ArticlePageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()
  const metadata = pageMetadata({ title: article.seoTitle || article.title, description: article.seoDescription || article.excerpt || article.title, path: `/learning/${slug}` })
  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: 'article',
      ...(article.publishedAt && !Number.isNaN(Date.parse(article.publishedAt)) ? { publishedTime: article.publishedAt } : {}),
      ...(getContentImageUrl(article.featuredImage) ? { images: [getContentImageUrl(article.featuredImage)!] } : {}),
    },
  }
}

export async function generateStaticParams() {
  return (await getArticleSlugs()).map(slug => ({ slug }))
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()
  const date = article.publishedAt && !Number.isNaN(Date.parse(article.publishedAt)) ? new Date(article.publishedAt) : null

  return (
    <div className="pt-32 pb-16 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <Link href="/learning" className="inline-block text-brand-darkBlue font-semibold mb-8">← Back to the Learning Hub</Link>
        <header className="text-center space-y-5 mb-10 max-w-4xl mx-auto">
          {article.category?.name && <Badge>{article.category.name}</Badge>}
          <h1 className="text-display-sm md:text-display-md font-display text-brand-navy leading-tight">{article.title}</h1>
          {date && <time dateTime={date.toISOString()} className="block text-sm text-ink-muted">{date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</time>}
        </header>
        {article.featuredImage && <ContentImage asset={article.featuredImage} alt={article.featuredImage.alt || article.title} className="rounded-3xl mb-8" width={1200} height={675} sizes="(max-width: 1200px) 100vw, 1100px" loading="eager" />}
        <ArticleBody content={article.body} />
        {!!article.relatedArticles?.length && (
          <section className="mt-12 pt-10 border-t border-surface-card">
            <SectionLabel className="mb-6">Related Articles</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{article.relatedArticles.map(related => <ArticleCard key={related._id || related.slug.current} article={related} />)}</div>
          </section>
        )}
      </div>
    </div>
  )
}
