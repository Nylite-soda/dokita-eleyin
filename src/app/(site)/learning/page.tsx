// src/app/learning/page.tsx
import { client } from '@/lib/sanity.client'
import { allArticlesQuery } from '@/lib/sanity.queries'
import { groq } from 'next-sanity'
import SectionLabel from '@/components/ui/SectionLabel'
import LearningHubClient from './LearningHubClient'
import AnimateIn from '@/components/ui/AnimateIn'

export const revalidate = 60

export default async function LearningHubPage() {
  const [articles, categories] = await Promise.all([
    client.fetch(allArticlesQuery),
    client.fetch(groq`*[_type == "category"] | order(name asc)`)
  ])

  return (
    <div className="pt-32 pb-16 min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <AnimateIn direction="up" delay={0}>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs tracking-widest uppercase font-semibold text-brand-lightBlue block mb-3">Learning Hub</span>
            <h1 className="text-4xl lg:text-5xl font-display font-semibold text-ink leading-tight mb-4">
              Dental tips for a lifetime of healthy smiles.
            </h1>
            <p className="text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed">
              Explore our collection of articles, myths, and guides designed to make oral health simple for everyone.
            </p>
          </div>
        </AnimateIn>

        <LearningHubClient articles={articles} categories={categories} />
      </div>
    </div>
  )
}

