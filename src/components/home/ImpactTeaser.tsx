// src/components/home/ImpactTeaser.tsx
'use client'
import Link from 'next/link'
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import { IconUsers, IconSchool, IconChecklist, IconGift, IconDeviceMobile } from '@tabler/icons-react'
import { ImpactStat } from '@/types'

interface ImpactTeaserProps {
  stats: ImpactStat[]
}

const iconMap: Record<string, any> = {
  'ti-users': <IconUsers size={28} />,
  'ti-school': <IconSchool size={28} />,
  'ti-checklist': <IconChecklist size={28} />,
  'ti-gift': <IconGift size={28} />,
  'ti-mobile': <IconDeviceMobile size={28} />,
  'ti-building': <IconSchool size={28} />,
}

const fallbackStats = [
  { label: 'Individuals Reached', value: 500, icon: 'ti-users', iconName: 'ti-users' },
  { label: 'Schools Visited', value: 5, icon: 'ti-school', iconName: 'ti-building' },
  { label: 'Kits Distributed', value: 25, icon: 'ti-gift', iconName: 'ti-gift' },
]

export default function ImpactTeaser({ stats }: ImpactTeaserProps) {
  const displayStats = stats?.length ? stats : fallbackStats

  return (
    <section className="py-24 bg-surface-soft relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-lightBlue/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
      
      <div className="max-w-6xl mx-auto px-6 md:px-12 text-center relative z-10">
        <div className="max-w-3xl mx-auto mb-10 space-y-4">
          <div className="inline-block px-8 py-1.5 rounded-full bg-white text-brand-darkBlue text-xs font-bold uppercase tracking-widest shadow-sm mb-4">
            Our Journey So Far
          </div>
          <h2 className="text-display-md font-display text-brand-navy">The scale of our mission</h2>
          <p className="text-lg text-ink/50 font-body max-w-xl mx-auto">
            Beyond the numbers, our impact is measured in the smiles we've protected and the habits we've helped build across communities.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
          {displayStats.slice(0, 3).map((s: any, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group text-center border border-brand-lightBlue/5">
              <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-2xl bg-brand-lightBlue/10 text-brand-darkBlue mb-6 group-hover:bg-brand-darkBlue group-hover:text-white transition-colors">
                {iconMap[s.icon] || iconMap[s.iconName] || <IconChecklist size={28} />}
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-display font-bold text-brand-navy mb-2">
                  <AnimatedCounter value={s.value} />+
                </div>
                <div className="text-xs font-body text-ink/40 uppercase tracking-widest font-bold">
                  {s.label}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <Link 
          href="/impact" 
          className="inline-flex items-center gap-2 bg-brand-navy text-white px-8 py-4 rounded-full font-bold font-body hover:bg-brand-darkBlue transition-all shadow-lg hover:shadow-brand-darkBlue/20"
        >
          See our full impact report
          <span className="text-xl">→</span>
        </Link>
      </div>
    </section>
  )
}
