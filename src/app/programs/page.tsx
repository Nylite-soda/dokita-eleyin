// src/app/programs/page.tsx
import { client } from '@/lib/sanity.client'
import { programsQuery } from '@/lib/sanity.queries'
import SectionLabel from '@/components/ui/SectionLabel'
import RichText from '@/components/ui/RichText'
import SanityImage from '@/components/ui/SanityImage'
import { IconCircleCheck } from '@tabler/icons-react'

export const revalidate = 60

export default async function ProgramsPage() {
  const programs = await client.fetch(programsQuery)

  const programTypes = [
    { id: 'school', label: 'School Initiatives' },
    { id: 'outreach', label: 'Community Outreach' },
    { id: 'digital', label: 'Digital Education' },
  ]

  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16 space-y-4">
          <SectionLabel>Our Programs</SectionLabel>
          <h1 className="text-display-md md:text-display-lg font-display text-brand-navy leading-tight">
            Structured initiatives for lasting dental health.
          </h1>
        </div>

        <div className="space-y-32">
          {programTypes.map((type) => {
            const filteredPrograms = programs.filter((p: any) => p.type === type.id)
            if (filteredPrograms.length === 0) return null

            return (
              <div key={type.id} className="space-y-16">
                <div className="border-b border-surface-card pb-8">
                  <h2 className="text-display-sm font-display text-brand-darkBlue uppercase tracking-widest">
                    {type.label}
                  </h2>
                </div>

                <div className="space-y-24">
                  {filteredPrograms.map((program: any) => (
                    <div key={program._id} className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-3xl font-display font-bold text-brand-navy mb-4">
                            {program.name}
                          </h3>
                          <p className="text-lg text-ink/70 font-body leading-relaxed">
                            {program.shortDescription}
                          </p>
                        </div>
                        
                        <div className="space-y-4">
                          <h4 className="font-display font-bold text-ink uppercase tracking-wider text-sm">Key Activities</h4>
                          <ul className="space-y-3">
                            {program.activities?.map((activity: string, idx: number) => (
                              <li key={idx} className="flex items-center gap-3 font-body text-ink/70">
                                <IconCircleCheck className="text-brand-lightBlue shrink-0" size={20} />
                                {activity}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="prose prose-blue font-body text-ink/60">
                          <RichText value={program.fullDescription} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {program.images?.slice(0, 4).map((img: any, idx: number) => (
                          <div key={idx} className={idx === 0 ? "col-span-2 aspect-video" : "aspect-square"}>
                            <SanityImage 
                              asset={img} 
                              alt={program.name}
                              className="rounded-3xl shadow-sm h-full"
                              fill
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
