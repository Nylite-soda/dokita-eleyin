// src/components/learning/CategoryFilter.tsx
'use client'
import { cn } from '@/lib/utils'
import { Category } from '@/types'

interface CategoryFilterProps {
  categories: Category[]
  activeCategory: string | null
  onCategoryChange: (slug: string | null) => void
}

export default function CategoryFilter({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}: CategoryFilterProps) {
  return (
    <div role="group" aria-label="Filter articles by category" className="flex flex-wrap justify-center gap-3 mb-12">
      <button
        type="button"
        aria-pressed={activeCategory === null}
        onClick={() => onCategoryChange(null)}
        className={cn(
          "px-8 py-2 rounded-full text-sm font-semibold transition-all",
          activeCategory === null 
            ? "bg-brand-darkBlue text-white" 
            : "bg-surface-card text-ink/60 hover:bg-brand-lightBlue/10"
        )}
      >
        All
      </button>
      
      {categories?.map((cat) => (
        <button
          type="button"
          aria-pressed={activeCategory === cat.slug.current}
          key={cat._id}
          onClick={() => onCategoryChange(cat.slug.current)}
          className={cn(
            "px-8 py-2 rounded-full text-sm font-semibold transition-all",
            activeCategory === cat.slug.current
              ? "bg-brand-darkBlue text-white"
              : "bg-surface-card text-ink/60 hover:bg-brand-lightBlue/10"
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}

