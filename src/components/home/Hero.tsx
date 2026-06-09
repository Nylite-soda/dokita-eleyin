// src/components/home/Hero.tsx
'use client'
import { Button } from '@/components/ui/Button'
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import SanityImage from '@/components/ui/SanityImage'
import SectionLabel from '@/components/ui/SectionLabel'

interface HeroProps {
  data: any
  stats: any[]
}

export default function Hero({ data, stats }: HeroProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-brand-darkBlue text-white overflow-hidden pt-32 pb-20">
      {/* Background Symbol Overlay */}
      <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 opacity-10 pointer-events-none">
        <img 
          src="/logos/icon-symbol-white.svg" 
          alt="" 
          className="w-[600px] h-[600px]"
        />
      </div>

      <div className="max-w-4xl mx-auto px-8 sm:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-[1.1] tracking-tight">
              {data?.heroHeadline || "Making oral health knowledge simple and accessible."}
            </h1>
            <p className="text-lg md:text-xl text-blue-100/80 font-body max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {data?.heroSubheadline || "We bridge the gap in dental education through community-led initiatives and simple, actionable guidance."}
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-4">
              <Button variant="secondary" size="lg" className="px-8 py-4" onClick={() => window.location.href = data?.heroPrimaryCTA?.link || '/consultation'}>
                {data?.heroPrimaryCTA?.label || "Book a Consultation"}
              </Button>
              <Button variant="ghost" size="lg" className="px-8 py-4" onClick={() => window.location.href = data?.heroSecondaryCTA?.link || '/about'}>
                {data?.heroSecondaryCTA?.label || "Learn About Us"}
              </Button>
            </div>

            {/* Social Proof Stats */}
            <div className="pt-12 grid grid-cols-2 sm:grid-cols-3 gap-8 border-t border-white/10">
              {stats?.slice(0, 3).map((stat, i) => (
                <div key={i} className="text-center lg:text-left">
                  <div className="text-3xl font-display font-bold text-brand-lightBlue">
                    <AnimatedCounter value={stat.value} />+
                  </div>
                  <div className="text-sm text-blue-100/60 font-body uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-5 w-full">
            <div className="py-8 lg:py-0 flex items-center justify-center">
              <div className="aspect-[4/5] w-full max-w-md lg:max-w-none max-h-[70vh] lg:max-h-[85vh] rounded-[3rem] overflow-hidden border-8 border-white/5 relative shadow-2xl">
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
      </div>
    </section>
  )
}
