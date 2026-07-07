// src/components/ui/AnimatedCounter.tsx
'use client'
import { useState, useEffect, useRef } from 'react'

interface AnimatedCounterProps {
  value: number
  duration?: number
}

export default function AnimatedCounter({ value, duration = 1500 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const containerRef = useRef<HTMLSpanElement>(null)
  const hasAnimatedRef = useRef(false)

  useEffect(() => {
    // Check for prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) {
      setCount(value)
      hasAnimatedRef.current = true
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true
          
          let startTime: number | null = null
          const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / duration, 1)
            // easeOut quadratic: 1 - (1 - t)^2
            const easeOutVal = 1 - Math.pow(1 - progress, 2)
            
            setCount(Math.floor(easeOutVal * value))

            if (progress < 1) {
              window.requestAnimationFrame(step)
            } else {
              setCount(value) // Ensure it lands exactly on the target value
            }
          }
          window.requestAnimationFrame(step)
        }
      },
      { threshold: 0.3 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [value, duration])

  return (
    <span ref={containerRef}>
      {count.toLocaleString()}
    </span>
  )
}
