// src/app/learning/page.tsx
import { client } from '@/lib/sanity.client'
import { allArticlesQuery } from '@/lib/sanity.queries'
import { groq } from 'next-sanity'
import SectionLabel from '@/components/ui/SectionLabel'
import LearningHubClient from './LearningHubClient'

export const revalidate = 60

export default async function LearningHubPage() {
  const [articles, categories] = await Promise.all([
    client.fetch(allArticlesQuery),
    client.fetch(groq`*[_type == "category"] | order(name asc)`)
  ])

  return (
    <div className="pt-32 pb-24 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <SectionLabel>Learning Hub</SectionLabel>
          <h1 className="text-display-md md:text-display-lg font-display text-brand-navy">
            Dental tips for a lifetime of healthy smiles.
          </h1>
          <p className="text-lg text-ink/60 font-body">
            Explore our collection of articles, myths, and guides designed to make oral health simple for everyone.
          </p>
        </div>

        <LearningHubClient articles={articles} categories={categories} />
      </div>
    </div>
  )
}
