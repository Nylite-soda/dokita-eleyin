// src/components/ui/AnimatedCounter.tsx
'use client'
import { useState, useEffect, useRef } from 'react'

interface AnimatedCounterProps {
  value: number
  duration?: number
}

export default function AnimatedCounter({ value, duration = 1500 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const countRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true)
        }
      },
      { threshold: 0.1 }
    )

    if (countRef.current) {
      observer.observe(countRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!hasStarted) return

    let startTime: number | null = null
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      
      setCount(Math.floor(easeOut * value))

      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }

    window.requestAnimationFrame(step)
  }, [hasStarted, value, duration])

  return (
    <span ref={countRef}>
      {count.toLocaleString()}
    </span>
  )
}
