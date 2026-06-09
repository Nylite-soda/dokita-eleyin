// src/app/outreach/page.tsx
import { client } from '@/lib/sanity.client'
import { outreachEventsQuery } from '@/lib/sanity.queries'
import SectionLabel from '@/components/ui/SectionLabel'
import { format } from 'date-fns'
import SanityImage from '@/components/ui/SanityImage'
import { IconMapPin, IconCalendar, IconUsers } from '@tabler/icons-react'

export const revalidate = 60

export default async function OutreachPage() {
  const events = await client.fetch(outreachEventsQuery)

  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16 space-y-4">
          <SectionLabel>Outreach Events</SectionLabel>
          <h1 className="text-display-md md:text-display-lg font-display text-brand-navy leading-tight">
            Our journey across communities.
          </h1>
          <p className="text-lg text-ink/60 font-body">
            From rural schools to urban community centers, we're on the move to ensure no one is left behind in oral health education.
          </p>
        </div>

        <div className="space-y-12">
          {events?.map((event: any) => (
            <div key={event._id} className="bg-surface-soft rounded-[2.5rem] overflow-hidden flex flex-col lg:flex-row border border-brand-lightBlue/10 hover:border-brand-lightBlue/30 transition-all">
              <div className="lg:w-1/3 h-64 lg:h-auto relative">
                {event.images?.[0] ? (
                  <SanityImage asset={event.images[0]} fill alt={event.name} />
                ) : (
                  <div className="w-full h-full bg-brand-navy/10 flex items-center justify-center text-brand-navy/20">
                    No image available
                  </div>
                )}
              </div>
              
              <div className="p-8 lg:p-12 lg:w-2/3 flex flex-col justify-center space-y-6">
                <div className="flex flex-wrap gap-3">
                  <span className="bg-brand-lightBlue text-brand-navy px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                    {event.venueType?.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-1 text-ink/40 text-sm font-body">
                    <IconCalendar size={16} />
                    {format(new Date(event.date), 'MMMM dd, yyyy')}
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-3xl font-display font-bold text-brand-navy">{event.name}</h2>
                  <div className="flex items-center gap-2 text-brand-darkBlue font-body font-medium">
                    <IconMapPin size={20} />
                    {event.location}
                  </div>
                </div>

                <p className="text-ink/60 font-body leading-relaxed max-w-2xl">
                  {event.description}
                </p>

                {event.peopleReached && (
                  <div className="pt-4 flex items-center gap-2 text-brand-darkBlue font-display font-bold">
                    <IconUsers size={24} />
                    <span>{event.peopleReached.toLocaleString()} people reached</span>
                  </div>
                )}

                {event.mapUrl && (
                  <div className="pt-6 w-full h-48 rounded-2xl overflow-hidden grayscale hover:grayscale-0 transition-all">
                    <iframe 
                      src={event.mapUrl} 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      allowFullScreen 
                      loading="lazy" 
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
