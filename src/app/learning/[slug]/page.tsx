// src/app/learning/[slug]/page.tsx
import { client } from '@/lib/sanity.client'
import { articleBySlugQuery } from '@/lib/sanity.queries'
import { groq } from 'next-sanity'
import SanityImage from '@/components/ui/SanityImage'
import ArticleBody from '@/components/learning/ArticleBody'
import Badge from '@/components/ui/Badge'
import { format } from 'date-fns'
import Link from 'next/link'
import ArticleCard from '@/components/learning/ArticleCard'
import SectionLabel from '@/components/ui/SectionLabel'
import { Metadata } from 'next'
import { urlForImage } from '@/lib/sanity.image'

export const revalidate = 60

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await client.fetch(articleBySlugQuery, { slug: params.slug })
  if (!article) return {}

  const ogImage = article.featuredImage 
    ? urlForImage(article.featuredImage).width(1200).height(630).url()
    : undefined

  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: ogImage ? [ogImage] : [],
      type: 'article',
      publishedTime: article.publishedAt,
    },
  }
}

export async function generateStaticParams() {
  const slugs = await client.fetch(groq`*[_type == "article"].slug.current`)
  return slugs.map((slug: string) => ({ slug }))
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await client.fetch(articleBySlugQuery, { slug: params.slug })

  if (!article) return <div>Article not found</div>

  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-6 mb-12">
            <Badge variant="children">{article.category?.name}</Badge>
            <h1 className="text-display-sm md:text-display-md font-display text-brand-navy leading-tight">
              {article.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-sm font-body text-ink/40">
              <span className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-brand-lightBlue/10 flex items-center justify-center p-1">
                   <img src="/logos/icon-symbol-color.svg" alt="" className="w-full h-full" />
                </div>
                <span className="font-semibold text-brand-navy">Dr. Ibukun</span>
              </span>
              <span>•</span>
              <span>{format(new Date(article.publishedAt), 'MMMM dd, yyyy')}</span>
            </div>
          </div>

          {/* Featured Image */}
          <SanityImage 
            asset={article.featuredImage} 
            alt={article.title}
            className="rounded-[2.5rem] shadow-2xl shadow-brand-darkBlue/5 mb-16 aspect-video"
            width={1200}
            height={675}
          />

          {/* Body Content */}
          <ArticleBody content={article.body} />

          {/* Related Articles */}
          {article.relatedArticles?.length > 0 && (
            <div className="mt-24 pt-16 border-t border-surface-card">
              <SectionLabel className="mb-8">Related Articles</SectionLabel>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {article.relatedArticles.map((rel: any) => (
                  <ArticleCard key={rel.slug.current} article={rel} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
