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
  const hasStats = stats && stats.length > 0

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

