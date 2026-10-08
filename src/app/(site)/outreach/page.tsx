// src/app/outreach/page.tsx
import { getOutreachEvents } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'
import SectionLabel from '@/components/ui/SectionLabel'
import ContentImage from '@/components/ui/ContentImage'
import { IconMapPin, IconCalendar, IconUsers, IconTruckDelivery } from '@tabler/icons-react'
import EmptyState from '@/components/ui/EmptyState'
import { OutreachEvent } from '@/types'
import AnimateIn from '@/components/ui/AnimateIn'

export const metadata = pageMetadata({
  title: 'Outreach',
  description: 'DÃ³kÃ­tÃ  ElÃ©yÃ­n dental outreach events in schools, churches, and communities across Nigeria.',
  path: '/outreach',
})

export const revalidate = 60

export default async function OutreachPage() {
  const events = await getOutreachEvents()

  return (
    <div className="pt-32 pb-16 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <AnimateIn direction="up" delay={0}>
          <div className="max-w-3xl mb-16">
            <SectionLabel>Outreach Events</SectionLabel>
            <h1 className="text-4xl lg:text-5xl font-display font-semibold text-ink leading-tight mb-4">
              Our journey across communities.
            </h1>
            <p className="text-lg text-ink-muted max-w-2xl leading-relaxed">
              Discover our published outreach events and ways to bring oral health education to your community.
            </p>
          </div>
        </AnimateIn>

        {(!events || events.length === 0) ? (
          <EmptyState
            title="Bring dental education to your community"
            message="No outreach events have been published yet. Contact us to discuss a session for your school, organization, or community."
            icon={<IconTruckDelivery size={32} />}
            actionLabel="Discuss an outreach session"
            actionHref="/contact"
          />
        ) : (
          <div className="space-y-12">
            {events.map((event: OutreachEvent) => (
              <div key={event._id} className="bg-surface-soft rounded-[2.5rem] overflow-hidden flex flex-col lg:flex-row border border-brand-lightBlue/10 hover:border-brand-lightBlue/30 transition-all">
                <div className="lg:w-1/3 h-64 lg:h-auto relative">
                  {event.images?.[0] ? (
                    <ContentImage asset={event.images[0]} fill alt={event.images[0].alt || event.name} sizes="(max-width: 1024px) 100vw, 33vw" />
                  ) : (
                    <div className="w-full h-full bg-brand-navy/10 flex items-center justify-center text-brand-navy/20">
                      Outreach event
                    </div>
                  )}
                </div>

                <div className="p-5 sm:p-8 lg:p-10 lg:w-2/3 flex flex-col justify-center space-y-6">
                  <div className="flex flex-wrap gap-3">
                    <span className="bg-brand-lightBlue text-brand-navy px-8 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                      {event.venueType?.replace('_', ' ') || 'Outreach'}
                    </span>
                    {event.date && !Number.isNaN(Date.parse(event.date)) && <div className="flex items-center gap-1 text-ink-muted text-sm font-body">
                      <IconCalendar size={16} />
                      <time dateTime={event.date}>{new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
                    </div>}
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

                  {typeof event.peopleReached === 'number' && (
                    <div className="pt-4 flex items-center gap-2 text-brand-darkBlue font-display font-bold">
                      <IconUsers size={24} />
                      <span>{event.peopleReached.toLocaleString()} people reached</span>
                    </div>
                  )}

                  {event.mapUrl && (
                    <div className="pt-6 w-full h-48 rounded-2xl overflow-hidden grayscale hover:grayscale-0 transition-all">
                      <iframe
                        title={`Map for ${event.name}`}
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
        )}
      </div>
    </div>
  )
}

