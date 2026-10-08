// src/components/ui/EmptyState.tsx
import Link from 'next/link'
import { Button } from './Button'
import Image from 'next/image'

interface EmptyStateProps {
  title: string
  message: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  icon?: React.ReactNode
}

export default function EmptyState({ 
  title, 
  message, 
  actionLabel, 
  actionHref,
  onAction,
  icon 
}: EmptyStateProps) {
  return (
    <div className="py-12 px-4 text-center max-w-lg mx-auto space-y-6">
      <div className="w-20 h-20 bg-surface-card rounded-3xl flex items-center justify-center mx-auto text-brand-darkBlue/20">
        {icon || (
          <Image src="/logos/icon-symbol-color.svg" alt="" width={40} height={40} />
        )}
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-display font-bold text-brand-navy">{title}</h2>
        <p className="text-ink-muted font-body leading-relaxed">{message}</p>
      </div>
      {actionLabel && actionHref && (
        <Button variant="outline" asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
      {actionLabel && onAction && <Button variant="outline" onClick={onAction}>{actionLabel}</Button>}
    </div>
  )
}

