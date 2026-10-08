import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return <main className="min-h-screen bg-brand-navy text-white flex items-center justify-center px-6 py-16">
    <div className="max-w-lg text-center space-y-7">
      <Image src="/logos/icon-symbol-white.svg" alt="" width={72} height={80} className="mx-auto" />
      <p className="text-brand-cyan text-sm font-semibold uppercase tracking-widest">Page not found</p>
      <h1 className="text-display-md font-semibold">Let’s get you back on track.</h1>
      <p className="text-white/90">This page may have moved or the link may be incomplete. You can return home or explore our oral health guides.</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild variant="secondary"><Link href="/">Go home</Link></Button>
        <Button asChild variant="ghost"><Link href="/learning">Explore the Learning Hub</Link></Button>
      </div>
    </div>
  </main>
}
