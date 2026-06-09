// src/components/home/Hero.tsx
'use client'
import { Button } from '@/components/ui/Button'
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import SanityImage from '@/components/ui/SanityImage'

interface HeroProps {
  data: any
  stats: any[]
}

export default function Hero({ data, stats }: HeroProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-brand-darkBlue text-white overflow-hidden pt-20">
      {/* Background Symbol Overlay */}
      <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 opacity-10 pointer-events-none">
        <img 
          src="/logos/icon-symbol-white.svg" 
          alt="" 
          className="w-[600px] h-[600px]"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8">
            <div className="w-48 mb-4">
               <img src="/logos/logo-stacked-white-tagline.svg" alt="Dókítà Eléyín" className="w-full" />
            </div>
            <h1 className="text-display-lg md:text-display-xl font-display leading-[1.1]">
              {data?.heroHeadline || "Making oral health knowledge simple and accessible."}
            </h1>
            <p className="text-lg md:text-xl text-blue-100/80 font-body max-w-2xl leading-relaxed">
              {data?.heroSubheadline || "We bridge the gap in dental education through community-led initiatives and simple, actionable guidance."}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button variant="secondary" size="lg" onClick={() => window.location.href = data?.heroPrimaryCTA?.link || '/consultation'}>
                {data?.heroPrimaryCTA?.label || "Book a Consultation"}
              </Button>
              <Button variant="ghost" size="lg" onClick={() => window.location.href = data?.heroSecondaryCTA?.link || '/about'}>
                {data?.heroSecondaryCTA?.label || "Learn About Us"}
              </Button>
            </div>

            {/* Social Proof Stats */}
            <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 border-t border-white/10">
              {stats?.slice(0, 3).map((stat, i) => (
                <div key={i}>
                  <div className="text-2xl font-display font-bold text-brand-lightBlue">
                    <AnimatedCounter value={stat.value} />+
                  </div>
                  <div className="text-sm text-blue-100/60 font-body">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-5 hidden lg:block">
            <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden border-8 border-white/5 relative shadow-2xl">
              {data?.heroImage?.asset ? (
                <SanityImage asset={data.heroImage} fill alt="Hero image" />
              ) : (
                <div className="w-full h-full bg-brand-navy/30 flex items-center justify-center text-white/10">
                   <img src="/logos/icon-symbol-white.svg" alt="" className="w-32 opacity-20" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}