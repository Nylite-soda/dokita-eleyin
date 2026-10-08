'use client'

import Link from 'next/link'

export default function SiteError({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return <div className="max-w-2xl mx-auto px-6 pt-40 pb-24 text-center space-y-6">
    <h1 className="text-display-md text-brand-navy">We couldn’t load this page.</h1>
    <p className="text-ink-muted">Please try again. You can also contact us if you need help booking a consultation or finding information.</p>
    <div className="flex flex-wrap justify-center gap-4">
      <button onClick={unstable_retry} className="rounded-full px-6 py-3 bg-brand-darkBlue text-white font-semibold">Try again</button>
      <Link href="/contact" className="rounded-full px-6 py-3 border border-brand-darkBlue text-brand-darkBlue font-semibold">Contact us</Link>
    </div>
  </div>
}
