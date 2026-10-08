// src/components/consultation/ServiceCard.tsx
import { ReactNode } from 'react'

interface ServiceCardProps {
  title: string
  desc: string
  icon: ReactNode
}

export default function ServiceCard({ title, desc, icon }: ServiceCardProps) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-surface-card hover:shadow-lg hover:shadow-brand-darkBlue/5 transition-shadow group h-full">
      <div className="w-12 h-12 bg-surface-soft text-brand-darkBlue rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-display font-bold text-brand-navy mb-3">{title}</h3>
      <p className="text-sm text-ink/80 font-body leading-relaxed">{desc}</p>
    </div>
  )
}

