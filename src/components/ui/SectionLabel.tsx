// src/components/ui/SectionLabel.tsx
import { cn } from '@/lib/utils'

interface SectionLabelProps {
  children: React.ReactNode
  className?: string
  variant?: 'lightBlue' | 'darkBlue' | 'navy'
}

export default function SectionLabel({ 
  children, 
  className,
  variant = 'darkBlue'
}: SectionLabelProps) {
  const variants = {
    lightBlue: "text-brand-lightBlue",
    darkBlue: "text-brand-darkBlue",
    navy: "text-brand-navy"
  }

  return (
    <span className={cn(
      variants[variant],
      "text-sm font-body font-bold tracking-[0.2em] uppercase block mb-2",
      className
    )}>
      {children}
    </span>
  )
}