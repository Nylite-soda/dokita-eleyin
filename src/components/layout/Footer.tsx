// src/components/layout/Footer.tsx
import Link from 'next/link'
import Image from 'next/image'
import { IconBrandInstagram, IconBrandTiktok, IconBrandYoutube, IconBrandLinkedin, IconBrandX, IconBrandFacebook } from '@tabler/icons-react'
import { getSiteSettings } from '@/lib/content'
import { getSocialLinks } from '@/lib/social'
import type { SiteSettings } from '@/types'
import NewsletterForm from '@/components/forms/NewsletterForm'

const socialIcons = {
  instagram: IconBrandInstagram,
  tiktok: IconBrandTiktok,
  youtube: IconBrandYoutube,
  linkedin: IconBrandLinkedin,
  twitter: IconBrandX,
  facebook: IconBrandFacebook,
}

export default async function Footer({ settings: suppliedSettings }: { settings?: SiteSettings | null }) {
  const settings = suppliedSettings === undefined ? await getSiteSettings() : suppliedSettings
  const social = getSocialLinks(settings?.socialHandles)

  return (
    <footer className="bg-brand-navy text-white pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 mb-12">
          {/* Column 1: Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-auto relative">
                <Link href="/" aria-label="Dókítà Eléyín home"><Image src="/logos/logo-horizontal-white-tagline.svg" alt="Dókítà Eléyín" width={1082} height={175} className="h-full w-auto max-w-full" /></Link>
              </div>
            </div>
            <p className="text-blue-100 font-body text-sm leading-relaxed max-w-xs">
              {settings?.footerDescription || 'Making oral health knowledge simple, accessible, and actionable for healthier communities.'}
            </p>
            <div className="flex space-x-4">
              {social.map(({ platform, label, url }) => {
                const Icon = socialIcons[platform]
                return <a key={platform} href={url} target="_blank" rel="noopener noreferrer" aria-label={`${label} (opens in a new tab)`} className="rounded-md p-2 hover:text-brand-lightBlue transition-colors focus-visible:outline-2 focus-visible:outline-brand-lightBlue"><Icon size={24} aria-hidden="true" /></a>
              })}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h2 className="font-display text-lg font-semibold mb-6 text-brand-lightBlue">Quick Links</h2>
            <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-y-3 gap-x-4 font-body text-sm text-blue-100">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
              <Link href="/learning" className="hover:text-white transition-colors">Learning Hub</Link>
              <Link href="/programs" className="hover:text-white transition-colors">Programs</Link>
              <Link href="/outreach" className="hover:text-white transition-colors">Outreach</Link>
              <Link href="/impact" className="hover:text-white transition-colors">Impact</Link>
              <Link href="/partnerships" className="hover:text-white transition-colors">Partnerships</Link>
              <Link href="/consultation" className="hover:text-white transition-colors">Consultation</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              <Link href="/founder" className="hover:text-white transition-colors">Meet the Founder</Link>
              <Link href="/faq" className="hover:text-white transition-colors">FAQs</Link>
            </nav>
          </div>

          {/* Column 3: Newsletter */}
          <div>
            <h2 className="font-display text-lg font-semibold mb-6 text-brand-lightBlue">Stay in the loop</h2>
            <p className="text-blue-100 font-body text-sm mb-6">Get dental tips straight to your inbox.</p>
            <NewsletterForm variant="inline" placeholder="Your email" />
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center">
          <p className="font-body text-xs text-blue-100">
            &copy; {new Date().getFullYear()} {settings?.siteName || 'Dókítà Eléyín'}. Made with care for healthier communities.
          </p>
        </div>
      </div>
    </footer>
  )
}

