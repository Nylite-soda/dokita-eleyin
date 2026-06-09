// src/components/home/ImpactTeaser.tsx
import Link from 'next/link'
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import { IconUsers, IconSchool, IconChecklist, IconGift, IconDeviceMobile } from '@tabler/icons-react'

interface ImpactTeaserProps {
  stats: any[]
}

const iconMap: Record<string, any> = {
  'ti-users': <IconUsers />,
  'ti-school': <IconSchool />,
  'ti-checklist': <IconChecklist />,
  'ti-gift': <IconGift />,
  'ti-mobile': <IconDeviceMobile />,
}

export default function ImpactTeaser({ stats }: ImpactTeaserProps) {
  return (
    <section className="py-24 bg-surface-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-16">
          {stats?.slice(0, 4).map((s, i) => (
            <div key={i} className="space-y-4 group">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-2xl bg-white text-brand-darkBlue shadow-sm group-hover:scale-110 transition-transform">
                {iconMap[s.icon] || <IconChecklist />}
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-display font-bold text-brand-navy">
                  <AnimatedCounter value={s.value} />+
                </div>
                <div className="text-sm font-body text-ink/50 uppercase tracking-wider font-semibold">
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <Link 
          href="/impact" 
          className="inline-flex items-center text-brand-darkBlue font-bold font-body hover:text-brand-lightBlue transition-colors group"
        >
          See our full impact 
          <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </section>
  )
}
