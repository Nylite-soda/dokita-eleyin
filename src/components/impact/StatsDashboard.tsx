// src/components/impact/StatsDashboard.tsx
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import { IconUsers, IconSchool, IconChecklist, IconGift, IconDeviceMobile } from '@tabler/icons-react'
import { ImpactStat } from '@/types'

interface StatsDashboardProps {
  stats: ImpactStat[]
}

const iconMap: Record<string, React.ReactNode> = {
  'ti-users': <IconUsers size={32} />,
  'ti-school': <IconSchool size={32} />,
  'ti-checklist': <IconChecklist size={32} />,
  'ti-gift': <IconGift size={32} />,
  'ti-mobile': <IconDeviceMobile size={32} />,
}

export default function StatsDashboard({ stats }: StatsDashboardProps) {
  return (
    <section className="py-16 bg-brand-navy text-white rounded-[3rem] my-12">
      <div className="max-w-6xl mx-auto px-8">
        <div className="flex flex-wrap justify-center gap-10">
          {stats?.map((stat, i) => (
            <div key={stat._id || i} className="text-center space-y-4 w-full sm:w-[calc(50%-1.25rem)] lg:w-[calc(33.333%-1.75rem)]">
              <div className="w-16 h-16 mx-auto bg-white/10 rounded-2xl flex items-center justify-center text-brand-lightBlue">
                {(stat.icon && iconMap[stat.icon]) || <IconChecklist size={32} />}
              </div>
              <div>
                <div className="text-4xl font-display font-bold text-white">
                  <AnimatedCounter value={stat.value} />{stat.suffix}
                </div>
                <p className="text-sm font-body text-blue-100 uppercase tracking-widest mt-2">
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

