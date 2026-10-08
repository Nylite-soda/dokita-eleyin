// src/app/newsletter/confirmed/page.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import SectionLabel from '@/components/ui/SectionLabel'
import Image from 'next/image'
import { pageMetadata } from '@/lib/seo'

export const metadata = { ...pageMetadata({ title: 'Newsletter Confirmation', description: 'Thank you for subscribing to the Dókítà Eléyín newsletter.', path: '/newsletter/confirmed' }), robots: { index: false, follow: true } }

export default function NewsletterConfirmedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-soft px-5 pt-32 pb-16">
      <div className="max-w-md w-full bg-white p-6 sm:p-10 rounded-3xl shadow-xl shadow-brand-darkBlue/5 text-center space-y-8">
        <div className="w-20 h-20 bg-brand-lightBlue/10 rounded-3xl flex items-center justify-center mx-auto">
           <Image src="/logos/icon-symbol-color.svg" alt="" width={48} height={48} />
        </div>
        
        <div className="space-y-4">
          <SectionLabel>Subscription Confirmed</SectionLabel>
          <h1 className="text-display-sm font-display text-brand-navy">Thank you!</h1>
          <p className="text-ink/60 font-body">
            Thank you for joining our newsletter. Watch your inbox for dental tips and updates from the team.
          </p>
        </div>

        <div className="pt-4">
          <Button variant="primary" size="lg" asChild className="w-full">
            <Link href="/learning">Explore Learning Hub</Link>
          </Button>
          <p className="mt-6 text-xs text-ink-muted font-body italic">
            Better knowledge, healthier smiles.
          </p>
        </div>
      </div>
    </div>
  )
}

