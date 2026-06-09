// src/components/layout/Footer.tsx
import Link from 'next/link'
import { IconBrandInstagram, IconBrandTiktok, IconBrandYoutube, IconBrandLinkedin } from '@tabler/icons-react'
import { client } from '@/lib/sanity.client'
import { siteSettingsQuery } from '@/lib/sanity.queries'
import NewsletterForm from '@/components/forms/NewsletterForm'

export default async function Footer() {
  const settings = await client.fetch(siteSettingsQuery)
  const social = settings?.socialHandles || {}

  return (
    <footer className="bg-brand-navy text-white pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Column 1: Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-auto relative">
                <img src="/logos/logo-horizontal-white-tagline.svg" alt="Dókítà Eléyín" className="h-full w-auto opacity-90" />
              </div>
            </div>
            <p className="text-blue-100/80 font-body text-sm leading-relaxed max-w-xs">
              {settings?.footerDescription || 'Making oral health knowledge simple, accessible, and actionable for healthier communities.'}
            </p>
            <div className="flex space-x-4">
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener" className="hover:text-brand-lightBlue transition-colors">
                  <IconBrandInstagram size={24} />
                </a>
              )}
              {social.tiktok && (
                <a href={social.tiktok} target="_blank" rel="noopener" className="hover:text-brand-lightBlue transition-colors">
                  <IconBrandTiktok size={24} />
                </a>
              )}
              {social.youtube && (
                <a href={social.youtube} target="_blank" rel="noopener" className="hover:text-brand-lightBlue transition-colors">
                  <IconBrandYoutube size={24} />
                </a>
              )}
              {social.linkedin && (
                <a href={social.linkedin} target="_blank" rel="noopener" className="hover:text-brand-lightBlue transition-colors">
                  <IconBrandLinkedin size={24} />
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-6 text-brand-lightBlue">Quick Links</h4>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 font-body text-sm text-blue-100/80">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
              <Link href="/learning" className="hover:text-white transition-colors">Learning Hub</Link>
              <Link href="/programs" className="hover:text-white transition-colors">Programs</Link>
              <Link href="/outreach" className="hover:text-white transition-colors">Outreach</Link>
              <Link href="/impact" className="hover:text-white transition-colors">Impact</Link>
              <Link href="/partnerships" className="hover:text-white transition-colors">Partnerships</Link>
              <Link href="/consultation" className="hover:text-white transition-colors">Consultation</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>

          {/* Column 3: Newsletter */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-6 text-brand-lightBlue">Stay in the loop</h4>
            <p className="text-blue-100/80 font-body text-sm mb-6">Get dental tips straight to your inbox.</p>
            <NewsletterForm variant="inline" />
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center">
          <p className="font-body text-xs text-blue-100/60">
            &copy; {new Date().getFullYear()} {settings?.siteName || 'Dókítà Eléyín'}. Made with care for healthier communities.
          </p>
        </div>
      </div>
    </footer>
  )
}

