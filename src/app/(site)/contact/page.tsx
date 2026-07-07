// src/app/contact/page.tsx
import { Metadata } from 'next'
import SectionLabel from '@/components/ui/SectionLabel'
import ContactForm from '@/components/forms/ContactForm'
import { IconMail, IconPhone, IconMapPin, IconBrandInstagram, IconBrandTiktok, IconBrandYoutube } from '@tabler/icons-react'
import { client } from '@/lib/sanity.client'
import { siteSettingsQuery } from '@/lib/sanity.queries'
import AnimateIn from '@/components/ui/AnimateIn'

export const metadata: Metadata = {
  title: 'Contact | Dókítà Eléyín',
  description: 'Get in touch with the Dókítà Eléyín team for enquiries, media requests, partnerships, or speaking engagements.',
}

export default async function ContactPage() {
  const settings = await client.fetch(siteSettingsQuery)

  return (
    <div className="pt-32 pb-16 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left: Contact Info */}
          <div className="lg:col-span-5 space-y-12">
            <AnimateIn direction="up" delay={0}>
              <div>
                <span className="text-xs tracking-widest uppercase font-semibold text-brand-lightBlue block mb-3">Get in touch</span>
                <h1 className="text-4xl lg:text-5xl font-display font-semibold text-ink leading-tight mb-4">
                  We'd love to hear from you.
                </h1>
                <p className="text-lg text-ink-muted max-w-2xl leading-relaxed">
                  Have a question about oral health? Want to invite us to your school? Or just want to say hello? Drop us a message.
                </p>
              </div>
            </AnimateIn>

            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 shrink-0 bg-brand-lightBlue/10 text-brand-darkBlue rounded-2xl flex items-center justify-center">
                  <IconMail size={24} />
                </div>
                <div>
                  <h4 className="font-display font-bold text-brand-navy">Email Us</h4>
                  <p className="text-ink/60 font-body">{settings?.contactEmail || 'hello@dokitaeleyin.com'}</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 shrink-0 bg-brand-cyan/10 text-brand-navy rounded-2xl flex items-center justify-center">
                  <IconPhone size={24} />
                </div>
                <div>
                  <h4 className="font-display font-bold text-brand-navy">Call/WhatsApp</h4>
                  <p className="text-ink/60 font-body">{settings?.contactPhone || '+234 (0) 812 345 6789'}</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 shrink-0 bg-brand-darkBlue/10 text-brand-darkBlue rounded-2xl flex items-center justify-center">
                  <IconMapPin size={24} />
                </div>
                <div>
                  <h4 className="font-display font-bold text-brand-navy">Our Office</h4>
                  <p className="text-ink/60 font-body">{settings?.address || 'Lagos, Nigeria'}</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-surface-card">
              <h4 className="font-display font-bold text-brand-navy mb-6">Follow our journey</h4>
              <div className="flex gap-4">
                {[IconBrandInstagram, IconBrandTiktok, IconBrandYoutube].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-xl bg-surface-card text-brand-darkBlue flex items-center justify-center hover:bg-brand-darkBlue hover:text-white transition-all">
                    <Icon size={20} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>

        </div>
      </div>
    </div>
  )
}

