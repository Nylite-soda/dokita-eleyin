// src/app/not-found.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-navy text-white px-5 pt-32 pb-16">
      <div className="text-center space-y-8 max-w-md">
        <div className="w-32 h-32 mx-auto bg-white/5 rounded-[2.5rem] flex items-center justify-center">
           <Image src="/logos/icon-symbol-white.svg" alt="" width={80} height={80} className="opacity-50" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-display-sm md:text-display-md font-display leading-tight">
            This page took a wrong turn.
          </h1>
          <p className="text-blue-100 font-body">
            We couldn&apos;t find this page. Return home or explore the Learning Hub.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="secondary" size="lg" asChild>
            <Link href="/">Go home</Link>
          </Button>
          <Button variant="ghost" size="lg" asChild>
            <Link href="/learning">Read dental tips</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

