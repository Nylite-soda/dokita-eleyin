// src/app/learning/LearningHubClient.tsx
'use client'
import { useState } from 'react'
import CategoryFilter from '@/components/learning/CategoryFilter'
import ArticleCard from '@/components/learning/ArticleCard'
import EmptyState from '@/components/ui/EmptyState'
import { IconSearch } from '@tabler/icons-react'
import { Article, Category } from '@/types'

interface LearningHubClientProps {
  articles: Article[]
  categories: Category[]
}

export default function LearningHubClient({ articles, categories }: LearningHubClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filteredArticles = activeCategory
    ? articles.filter(a => a.category?.slug?.current === activeCategory)
    : articles

  return (
    <>
      {articles.length > 0 && <CategoryFilter
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />}

      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No articles found"
          message={activeCategory
            ? "We haven't published anything in this category yet. Check back soon!"
            : "No articles have been published yet. Send us an oral health question or explore consultation options."
          }
          icon={<IconSearch size={32} />}
          actionLabel={activeCategory ? "Show all articles" : "Ask a question"}
          actionHref={activeCategory ? undefined : "/contact"}
          onAction={activeCategory ? () => setActiveCategory(null) : undefined}
        />
      )}
    </>
  )
}

