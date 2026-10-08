import { getSiteSettings } from '@/lib/content'
import { getSocialLinks } from '@/lib/social'
import { pageMetadata } from '@/lib/seo'
import SectionLabel from '@/components/ui/SectionLabel'
import ContactForm from '@/components/forms/ContactForm'
import { IconMail, IconPhone, IconMapPin } from '@tabler/icons-react'

export const metadata = pageMetadata({ title: 'Contact', description: 'Contact the Dókítà Eléyín team for enquiries, partnerships, media requests, or speaking engagements.', path: '/contact' })
export const revalidate = 60

export default async function ContactPage() {
  const settings = await getSiteSettings()
  const socials = getSocialLinks(settings?.socialHandles)
  const email = settings?.contactEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.contactEmail) ? settings.contactEmail : null
  const digits = settings?.contactPhone?.replace(/[^\d+]/g, '')
  const phone = digits && /^\+?[1-9]\d{7,14}$/.test(digits) && !digits.includes('123456789') ? digits : null

  return (
    <div className="pt-32 pb-16 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 md:px-12">
        <header className="max-w-3xl mb-10">
          <SectionLabel>Get in touch</SectionLabel>
          <h1 className="text-display-md font-display font-semibold text-ink leading-tight mb-4">We&apos;d love to hear from you.</h1>
          <p className="text-lg text-ink-muted leading-relaxed">Have an oral health question, a school invitation, or a partnership idea? Send us a message.</p>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 lg:order-2"><ContactForm /></div>
          <aside className="lg:col-span-5 lg:order-1 space-y-8">
            {email && <div className="flex items-start gap-4"><IconMail className="text-brand-darkBlue shrink-0" size={24} aria-hidden="true" /><div><h2 className="font-display font-semibold text-brand-navy mb-1">Email us</h2><a href={`mailto:${email}`} className="text-brand-darkBlue underline underline-offset-4 break-all">{email}</a></div></div>}
            {phone && <div className="flex items-start gap-4"><IconPhone className="text-brand-darkBlue shrink-0" size={24} aria-hidden="true" /><div><h2 className="font-display font-semibold text-brand-navy mb-1">Call us</h2><a href={`tel:${phone}`} className="text-brand-darkBlue underline underline-offset-4">{settings?.contactPhone}</a></div></div>}
            {settings?.address && <div className="flex items-start gap-4"><IconMapPin className="text-brand-darkBlue shrink-0" size={24} aria-hidden="true" /><div><h2 className="font-display font-semibold text-brand-navy mb-1">Our location</h2><p className="text-ink-muted whitespace-pre-line">{settings.address}</p></div></div>}
            {!!socials.length && <section className="pt-6 border-t border-surface-card"><h2 className="font-display font-semibold text-brand-navy mb-4">Follow our journey</h2><div className="flex flex-wrap gap-4">{socials.map(social => <a key={social.platform} href={social.url} target="_blank" rel="noopener noreferrer" className="text-brand-darkBlue font-semibold underline underline-offset-4">{social.label}<span className="sr-only"> (opens in a new tab)</span></a>)}</div></section>}
          </aside>
        </div>
      </div>
    </div>
  )
}
