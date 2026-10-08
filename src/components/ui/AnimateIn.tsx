'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface AnimateInProps {
  children: React.ReactNode
  direction?: 'up' | 'left' | 'right'
  delay?: number
  duration?: number
  className?: string
}

/** Server-rendered content stays readable without JavaScript or motion support. */
export default function AnimateIn({ children, className }: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    element.dataset.motion = 'pending'
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      element.dataset.motion = 'visible'
      observer.disconnect()
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' })

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return <div ref={ref} className={cn('section-entry', className)}>{children}</div>
}
