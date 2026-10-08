// src/app/impact/page.tsx
import { getImpact } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'
import SectionLabel from '@/components/ui/SectionLabel'
import StatsDashboard from '@/components/impact/StatsDashboard'
import ImpactStoryCard from '@/components/impact/ImpactStoryCard'
import EmptyState from '@/components/ui/EmptyState'
import { IconHeart } from '@tabler/icons-react'
import AnimateIn from '@/components/ui/AnimateIn'

export const metadata = pageMetadata({
  title: 'Community Impact',
  description: 'See the real-world impact of DÃ³kÃ­tÃ  ElÃ©yÃ­n â€” schools engaged, communities reached, and lives improved through oral health education.',
  path: '/impact',
})

export const revalidate = 60

export default async function ImpactPage() {
  const { stats, stories } = await getImpact()

  const hasContent = (stats && stats.length > 0) || (stories && stories.length > 0)

  return (
    <div className="pt-32 pb-16 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <AnimateIn direction="up" delay={0}>
          <div className="max-w-3xl mb-16">
            <SectionLabel>Our Impact</SectionLabel>
            <h1 className="text-4xl lg:text-5xl font-display font-semibold text-ink leading-tight mb-4">
              Measuring our reach and hearing from the community.
            </h1>
            <p className="text-lg text-ink-muted max-w-2xl leading-relaxed">
              Every number represents a person empowered with better dental knowledge. Every story is a reminder of why we exist.
            </p>
          </div>
        </AnimateIn>

        {!hasContent ? (
          <EmptyState
            title="Follow our community impact"
            message="No impact figures or community stories have been published yet. Contact the team to learn about our work or discuss ways to support it."
            icon={<IconHeart size={32} />}
            actionLabel="Contact the team"
            actionHref="/contact"
          />
        ) : (
          <>
            {stats && stats.length > 0 && <StatsDashboard stats={stats} />}

            {stories && stories.length > 0 ? (
              <div className="mt-24 space-y-12">
                <div>
                  <SectionLabel>Human Stories</SectionLabel>
                  <h2 className="text-display-sm font-display text-brand-navy">Voices from the community</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {stories.map(story => (
                    <ImpactStoryCard key={story._id} story={story} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center max-w-xl mx-auto">
                <IconHeart size={40} className="text-brand-lightBlue mx-auto mb-4" />
                <h2 className="font-display text-2xl font-semibold text-ink mb-3">Community stories</h2>
                <p className="text-base text-ink-muted">
                  No community stories have been published yet.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

