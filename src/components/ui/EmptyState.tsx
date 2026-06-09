// src/components/ui/EmptyState.tsx
import Link from 'next/link'
import { Button } from './Button'
import SectionLabel from './SectionLabel'

interface EmptyStateProps {
  title: string
  message: string
  actionLabel?: string
  actionHref?: string
  icon?: React.ReactNode
}

export default function EmptyState({ 
  title, 
  message, 
  actionLabel, 
  actionHref,
  icon 
}: EmptyStateProps) {
  return (
    <div className="py-20 px-8 text-center max-w-lg mx-auto space-y-6">
      <div className="w-20 h-20 bg-surface-card rounded-3xl flex items-center justify-center mx-auto text-brand-darkBlue/20">
        {icon || (
          <img src="/logos/icon-symbol-color.svg" alt="" className="w-10 h-10 opacity-20" />
        )}
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-display font-bold text-brand-navy">{title}</h3>
        <p className="text-ink/50 font-body leading-relaxed">{message}</p>
      </div>
      {actionLabel && actionHref && (
        <Button variant="outline" asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  )
}

