// src/components/ui/SectionLabel.tsx
import { cn } from '@/lib/utils'

interface SectionLabelProps {
  children: string
  className?: string
}

export default function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <p className={cn(
      "text-brand-lightBlue text-sm font-body font-semibold tracking-widest uppercase",
      className
    )}>
      {children}
    </p>
  )
}
