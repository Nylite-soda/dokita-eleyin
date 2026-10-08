import type { Metadata } from 'next'
import Link from 'next/link'
import { IconHeart, IconMessageHeart, IconMoodSmile, IconShieldCheck, IconStethoscope } from '@tabler/icons-react'
import SectionLabel from '@/components/ui/SectionLabel'
import FaqSection from '@/components/faq/FaqSection'
import ServiceCard from '@/components/consultation/ServiceCard'
import BookingWidget from '@/components/consultation/BookingWidget'
import { getFAQs, getSiteSettings } from '@/lib/content'
import { getAvailability, getServices, paymentConfigured } from '@/lib/booking'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export const metadata: Metadata = {
  title: 'Book a Consultation',
  description: 'Request a private oral health consultation with Dr. Ibukun and ask about availability, fees, and session details.',
  alternates: { canonical: '/consultation' },
}

const services = [
  { title: 'Oral Health Education', icon: <IconMessageHeart />, desc: 'Personalized guidance on maintaining your dental health.' },
  { title: 'Preventive Care', icon: <IconShieldCheck />, desc: 'Understanding how to avoid common dental issues before they start.' },
  { title: 'Treatment Guidance', icon: <IconStethoscope />, desc: 'Clear explanations of dental treatment options available to you.' },
  { title: "Children’s Oral Health", icon: <IconMoodSmile />, desc: 'Advice for parents and caregivers on children’s dental care.' },
  { title: 'Hygiene Coaching', icon: <IconHeart />, desc: 'One-on-one coaching for better brushing and flossing techniques.' },
  { title: 'Second Opinion', icon: <IconStethoscope />, desc: 'A professional perspective on your existing dental concerns.' },
]

export default async function ConsultationPage() {
  const [settings, faqs] = await Promise.all([getSiteSettings(), getFAQs('consultation')])
  const [{ timezone, minNoticeHours, windowDays, cancellationNoticeHours, cancellationPolicy }, availableServices] = await Promise.all([getAvailability(), getServices(false)])

  return (
    <div className="pt-32 pb-20 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 md:px-12 space-y-14 md:space-y-20">
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <SectionLabel>Expert Guidance</SectionLabel>
          <h1 className="text-display-md md:text-display-lg font-display text-brand-navy">Book a session with Dr. Ibukun</h1>
          <p className="text-lg text-ink/80 font-body leading-relaxed">{settings?.bookingSummary || 'Get personalized dental education and preventive guidance. Ask the team about a session that fits your needs.'}</p>
        </header>

        <section aria-labelledby="booking-heading" className="space-y-6">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 id="booking-heading" className="text-display-sm font-display text-brand-navy">Arrange your consultation</h2>
            <p className="text-ink/80 leading-relaxed">Tell us what you would like help with. Confirm the fee, session length, appointment format, and cancellation or rescheduling terms before booking.</p>
            {(settings?.consultationPrice || settings?.consultationDuration) && <dl className="flex flex-wrap justify-center gap-6 text-brand-navy">
              {settings.consultationPrice && <div><dt className="font-bold">Fee</dt><dd>{settings.consultationPrice}</dd></div>}
              {settings.consultationDuration && <div><dt className="font-bold">Session length</dt><dd>{settings.consultationDuration}</dd></div>}
            </dl>}
          </div>
          <BookingWidget services={availableServices.filter(service => !service.depositNGN || paymentConfigured())} availability={{ timezone, minNoticeHours, windowDays, cancellationNoticeHours, cancellationPolicy }} />
        </section>

        <section aria-labelledby="services-heading" className="space-y-7">
          <h2 id="services-heading" className="text-display-sm font-display text-brand-navy text-center">What we can discuss</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{services.map(service => <ServiceCard key={service.title} {...service} />)}</div>
          <p className="text-center text-ink/80">Learn about <Link href="/founder" className="text-brand-darkBlue underline underline-offset-4">Dr. Ibukun and Dókítà Eléyín</Link>.</p>
        </section>

        <FaqSection faqs={faqs} title="Consultation questions" />
      </div>
    </div>
  )
}
