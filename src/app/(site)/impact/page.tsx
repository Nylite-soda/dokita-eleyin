// src/app/impact/page.tsx
import { Metadata } from 'next'
import { client } from '@/lib/sanity.client'
import { impactPageQuery } from '@/lib/sanity.queries'
import SectionLabel from '@/components/ui/SectionLabel'
import StatsDashboard from '@/components/impact/StatsDashboard'
import ImpactStoryCard from '@/components/impact/ImpactStoryCard'
import EmptyState from '@/components/ui/EmptyState'
import { IconHeart } from '@tabler/icons-react'
import AnimateIn from '@/components/ui/AnimateIn'

export const metadata: Metadata = {
  title: 'Community Impact | Dókítà Eléyín',
  description: 'See the real-world impact of Dókítà Eléyín — schools engaged, communities reached, and lives improved through oral health education.',
}

export const revalidate = 60

export default async function ImpactPage() {
  const { stats, stories } = await client.fetch(impactPageQuery)

  const hasContent = (stats && stats.length > 0) || (stories && stories.length > 0)

  return (
    <div className="pt-32 pb-16 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <AnimateIn direction="up" delay={0}>
          <div className="max-w-3xl mb-16">
            <span className="text-xs tracking-widest uppercase font-semibold text-brand-lightBlue block mb-3">Our Impact</span>
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
            title="Impact stories coming soon" 
            message="We're currently compiling our latest impact data and community stories. Check back shortly to see the change we're making."
            icon={<IconHeart size={32} />}
          />
        ) : (
          <>
            {stats && stats.length > 0 && <StatsDashboard stats={stats} />}

            {stories && stories.length > 0 ? (
              <div className="mt-24 space-y-12">
                <div>
                  <span className="text-xs tracking-widest uppercase font-semibold text-brand-lightBlue block mb-3">Human Stories</span>
                  <h2 className="text-display-sm font-display text-brand-navy">Voices from the community</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {stories.map((story: any) => (
                    <ImpactStoryCard key={story._id} story={story} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center max-w-xl mx-auto">
                <IconHeart size={40} className="text-brand-lightBlue mx-auto mb-4" />
                <h2 className="font-display text-2xl font-semibold text-ink mb-3">Impact stories coming soon</h2>
                <p className="text-base text-ink-muted">
                  We're collecting stories from the communities we've served. Check back soon.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

