// src/components/ui/AnimateIn.tsx
'use client'
import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

interface AnimateInProps {
  children: React.ReactNode
  direction?: 'up' | 'left' | 'right'
  delay?: number
  duration?: number
  className?: string
}

export default function AnimateIn({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  className
}: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const shouldReduceMotion = useReducedMotion()

  const getVariants = () => {
    if (shouldReduceMotion) {
      return {
        hidden: { opacity: 1, x: 0, y: 0 },
        visible: { opacity: 1, x: 0, y: 0 }
      }
    }

    switch (direction) {
      case 'left':
        return {
          hidden: { opacity: 0, x: -30, y: 0 },
          visible: { opacity: 1, x: 0, y: 0 }
        }
      case 'right':
        return {
          hidden: { opacity: 0, x: 30, y: 0 },
          visible: { opacity: 1, x: 0, y: 0 }
        }
      case 'up':
      default:
        return {
          hidden: { opacity: 0, x: 0, y: 30 },
          visible: { opacity: 1, x: 0, y: 0 }
        }
    }
  }

  const variants = getVariants()

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{
        duration: shouldReduceMotion ? 0 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
