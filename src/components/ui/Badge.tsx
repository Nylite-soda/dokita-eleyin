// src/components/ui/Badge.tsx
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: string
  variant?: 'children' | 'parents' | 'adults' | 'myths'
  className?: string
}

export default function Badge({ children, variant = 'children', className }: BadgeProps) {
  const variants = {
    children: 'bg-brand-lightBlue/20 text-brand-darkBlue',
    parents: 'bg-brand-cyan/20 text-brand-navy',
    adults: 'bg-brand-darkBlue/20 text-brand-darkBlue',
    myths: 'bg-teal-500/20 text-teal-700',
  }

  return (
    <span className={cn(
      "inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider",
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}

