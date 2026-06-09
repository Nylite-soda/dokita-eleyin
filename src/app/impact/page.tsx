// src/app/impact/page.tsx
import { client } from '@/lib/sanity.client'
import { impactPageQuery } from '@/lib/sanity.queries'
import SectionLabel from '@/components/ui/SectionLabel'
import StatsDashboard from '@/components/impact/StatsDashboard'
import ImpactStoryCard from '@/components/impact/ImpactStoryCard'

export const revalidate = 60

export default async function ImpactPage() {
  const { stats, stories } = await client.fetch(impactPageQuery)

  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16 space-y-4">
          <SectionLabel>Our Impact</SectionLabel>
          <h1 className="text-display-md md:text-display-lg font-display text-brand-navy">
            Measuring our reach and hearing from the community.
          </h1>
          <p className="text-lg text-ink/60 font-body">
            Every number represents a person empowered with better dental knowledge. Every story is a reminder of why we exist.
          </p>
        </div>

        <StatsDashboard stats={stats} />

        <div className="mt-24 space-y-12">
          <div className="space-y-4">
            <SectionLabel>Human Stories</SectionLabel>
            <h2 className="text-display-sm font-display text-brand-navy">Voices from the community</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {stories?.map((story: any) => (
              <ImpactStoryCard key={story._id} story={story} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
