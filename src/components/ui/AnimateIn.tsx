import { cn } from '@/lib/utils'

interface AnimateInProps {
  children: React.ReactNode
  direction?: 'up' | 'left' | 'right'
  delay?: number
  duration?: number
  className?: string
}

/** Content is visible in the server response; optional CSS motion never gates reading. */
export default function AnimateIn({ children, className }: AnimateInProps) {
  return <div className={cn('section-entry', className)}>{children}</div>
}
