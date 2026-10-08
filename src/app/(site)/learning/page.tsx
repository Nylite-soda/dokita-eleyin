// src/app/learning/page.tsx
import { getArticles, getCategories } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'
import SectionLabel from '@/components/ui/SectionLabel'
import LearningHubClient from './LearningHubClient'
import AnimateIn from '@/components/ui/AnimateIn'

export const revalidate = 60
export const metadata = pageMetadata({ title: 'Learning Hub', description: 'Explore dental health articles, guides, and answers to common oral health questions.', path: '/learning' })

export default async function LearningHubPage() {
  const [articles, categories] = await Promise.all([
    getArticles(),
    getCategories()
  ])

  return (
    <div className="pt-32 pb-16 min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <AnimateIn direction="up" delay={0}>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <SectionLabel>Learning Hub</SectionLabel>
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

