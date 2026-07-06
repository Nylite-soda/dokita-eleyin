// src/components/impact/StatsDashboard.tsx
'use client'
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import { IconUsers, IconSchool, IconChecklist, IconGift, IconDeviceMobile } from '@tabler/icons-react'
import { ImpactStat } from '@/types'

interface StatsDashboardProps {
  stats: ImpactStat[]
}

const iconMap: Record<string, any> = {
  'ti-users': <IconUsers size={32} />,
  'ti-school': <IconSchool size={32} />,
  'ti-checklist': <IconChecklist size={32} />,
  'ti-gift': <IconGift size={32} />,
  'ti-mobile': <IconDeviceMobile size={32} />,
}

export default function StatsDashboard({ stats }: StatsDashboardProps) {
  return (
    <section className="py-24 bg-brand-navy text-white rounded-[3rem] my-12">
      <div className="max-w-6xl mx-auto px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12">
          {stats?.map((stat, i) => (
            <div key={i} className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-white/10 rounded-2xl flex items-center justify-center text-brand-lightBlue">
                {(stat.icon && iconMap[stat.icon]) || <IconChecklist size={32} />}
              </div>
              <div>
                <div className="text-4xl font-display font-bold text-white">
                  <AnimatedCounter value={stat.value} />
                </div>
                <p className="text-xs font-body text-blue-100/50 uppercase tracking-widest mt-2">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

