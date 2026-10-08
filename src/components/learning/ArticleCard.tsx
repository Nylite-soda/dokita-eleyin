// src/components/learning/ArticleCard.tsx
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import ContentImage from '@/components/ui/ContentImage'
import { Article } from '@/types'

interface ArticleCardProps {
  article: Article
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const date = article.publishedAt && !Number.isNaN(Date.parse(article.publishedAt)) ? new Date(article.publishedAt) : null
  return (
    <Link
      href={`/learning/${article.slug.current}`}
      className="group bg-white rounded-3xl overflow-hidden border border-surface-card border-l-[3px] border-l-transparent hover:border-l-[#55C9F4] hover:-translate-y-[4px] hover:shadow-[0_8px_24px_rgba(46,92,169,0.12)] transition-[transform,box-shadow,border-left-color] duration-150 ease-out"
    >
      {article.featuredImage && <div className="aspect-[16/9] relative overflow-hidden">
        <ContentImage
          asset={article.featuredImage}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="group-hover:scale-105 transition-transform duration-500"
        />
      </div>}

      <div className="p-5 sm:p-6 space-y-4">
        <Badge variant={article.category?.slug?.current === 'childrens-oral-health' ? 'children' : 'adults'}>
          {article.category?.name || 'General'}
        </Badge>

        <h3 className="text-xl font-display font-bold text-brand-navy leading-tight group-hover:text-brand-darkBlue transition-colors">
          {article.title}
        </h3>

        <p className="text-sm text-ink/60 font-body line-clamp-2 leading-relaxed">
          {article.excerpt}
        </p>

        {date && <time dateTime={date.toISOString()} className="block pt-4 border-t border-surface-card text-xs text-ink-muted font-body">{date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</time>}
      </div>
    </Link>
  )
}

