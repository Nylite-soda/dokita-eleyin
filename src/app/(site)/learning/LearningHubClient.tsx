// src/app/learning/LearningHubClient.tsx
'use client'
import { useState } from 'react'
import CategoryFilter from '@/components/learning/CategoryFilter'
import ArticleCard from '@/components/learning/ArticleCard'
import EmptyState from '@/components/ui/EmptyState'
import { IconSearch } from '@tabler/icons-react'

interface LearningHubClientProps {
  articles: any[]
  categories: any[]
}

export default function LearningHubClient({ articles, categories }: LearningHubClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filteredArticles = activeCategory
    ? articles.filter(a => a.category?.slug?.current === activeCategory)
    : articles

  return (
    <>
      <CategoryFilter 
        categories={categories} 
        activeCategory={activeCategory} 
        onCategoryChange={setActiveCategory} 
      />
      
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
            : "The Learning Hub is currently being updated with new dental tips."
          }
          icon={<IconSearch size={32} />}
          actionLabel={activeCategory ? "Show all articles" : undefined}
          actionHref={activeCategory ? "/learning" : undefined}
        />
      )}
    </>
  )
}

