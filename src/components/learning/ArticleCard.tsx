// src/components/learning/ArticleCard.tsx
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import SanityImage from '@/components/ui/SanityImage'
import { format } from 'date-fns'

interface ArticleCardProps {
  article: any
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link 
      href={`/learning/${article.slug.current}`}
      className="group bg-white rounded-3xl overflow-hidden border border-surface-card border-l-[3px] border-l-transparent hover:border-l-[#55C9F4] hover:-translate-y-[4px] hover:shadow-[0_8px_24px_rgba(46,92,169,0.12)] transition-[transform,box-shadow,border-left-color] duration-150 ease-out"
    >
      <div className="aspect-[16/9] relative overflow-hidden">
        <SanityImage 
          asset={article.featuredImage} 
          alt={article.title}
          fill
          className="group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      
      <div className="p-8 space-y-4">
        <Badge variant={article.category?.slug?.current === 'childrens-oral-health' ? 'children' : 'adults'}>
          {article.category?.name || 'General'}
        </Badge>
        
        <h3 className="text-xl font-display font-bold text-brand-navy leading-tight group-hover:text-brand-darkBlue transition-colors">
          {article.title}
        </h3>
        
        <p className="text-sm text-ink/60 font-body line-clamp-2 leading-relaxed">
          {article.excerpt}
        </p>
        
        <div className="pt-4 flex items-center justify-between border-t border-surface-card">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 relative">
              <img src="/logos/icon-symbol-color.svg" alt="Dr. Ibukun" className="w-full h-full object-contain" />
            </div>
            <span className="text-xs font-semibold text-brand-navy">Dr. Ibukun</span>
          </div>
          <span className="text-xs text-ink/40 font-body">
            {article.publishedAt ? format(new Date(article.publishedAt), 'MMM dd, yyyy') : 'Recently'}
          </span>
        </div>
      </div>
    </Link>
  )
}

