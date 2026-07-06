// src/components/home/LatestArticles.tsx
import Link from 'next/link'
import SectionLabel from '@/components/ui/SectionLabel'
import ArticleCard from '@/components/learning/ArticleCard'
import { Article } from '@/types'

interface LatestArticlesProps {
  articles: Article[]
}

export default function LatestArticles({ articles }: LatestArticlesProps) {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-4">
            <SectionLabel>Learning Hub</SectionLabel>
            <h2 className="text-display-md font-display text-brand-navy">Latest Dental Tips</h2>
          </div>
          <Link 
            href="/learning" 
            className="text-brand-darkBlue font-bold font-body hover:text-brand-lightBlue transition-colors group"
          >
            Explore all articles 
            <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles?.slice(0, 3).map((article, i) => (
            <ArticleCard key={i} article={article} />
          ))}
        </div>
      </div>
    </section>
  )
}

