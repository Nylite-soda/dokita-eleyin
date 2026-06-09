// src/app/not-found.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-navy text-white p-4">
      <div className="text-center space-y-8 max-w-md">
        <div className="w-32 h-32 mx-auto bg-white/5 rounded-[2.5rem] flex items-center justify-center">
           <img src="/logos/icon-symbol-white.svg" alt="" className="w-20 h-20 opacity-50" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-display-sm md:text-display-md font-display leading-tight">
            This page took a wrong turn.
          </h1>
          <p className="text-blue-100/60 font-body">
            Don't worry, even the best smiles need a checkup sometimes. Let's get you back on track.
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

