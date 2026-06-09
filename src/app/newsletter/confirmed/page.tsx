// src/app/newsletter/confirmed/page.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import SectionLabel from '@/components/ui/SectionLabel'

export default function NewsletterConfirmedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-soft p-4">
      <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-xl shadow-brand-darkBlue/5 text-center space-y-8">
        <div className="w-20 h-20 bg-brand-lightBlue/10 rounded-3xl flex items-center justify-center mx-auto">
           <img src="/logos/icon-symbol-color.svg" alt="" className="w-12 h-12" />
        </div>
        
        <div className="space-y-4">
          <SectionLabel>Subscription Confirmed</SectionLabel>
          <h1 className="text-display-sm font-display text-brand-navy">You're in!</h1>
          <p className="text-ink/60 font-body">
            Thank you for joining our newsletter. You'll now receive monthly dental tips and updates from Dr. Ibukun directly in your inbox.
          </p>
        </div>

        <div className="pt-4">
          <Button variant="primary" size="lg" asChild className="w-full">
            <Link href="/learning">Explore Learning Hub</Link>
          </Button>
          <p className="mt-6 text-xs text-ink/40 font-body italic">
            "Better knowledge, healthier smiles."
          </p>
        </div>
      </div>
    </div>
  )
}
