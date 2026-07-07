// src/components/ui/ToothLoader.tsx
'use client'
import { useEffect, useState, useRef } from 'react'

export default function ToothLoader() {
  const [progress, setProgress] = useState(0)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isFullyRemoved, setIsFullyRemoved] = useState(false)
  
  const animationCompleteRef = useRef(false)
  const pageReadyRef = useRef(false)
  const prefersReducedMotionRef = useRef(false)

  // Calculate fill parameters based on progress
  const fillY = 148 - (progress / 100) * 140
  const fillHeight = (progress / 100) * 140

  // Manually interpolate fill color between #55C9F4 (0-40%) and #2E5CA9 (75-100%)
  const getFillColor = (p: number): string => {
    if (p <= 40) return '#55C9F4'
    if (p >= 75) return '#2E5CA9'
    const t = (p - 40) / (75 - 40) // Normalized progress between 40% and 75%
    const r = Math.round(85 + (46 - 85) * t) // 85 (#55) to 46 (#2E)
    const g = Math.round(201 + (92 - 201) * t) // 201 (#C9) to 92 (#5C)
    const b = Math.round(244 + (169 - 244) * t) // 244 (#F4) to 169 (#A9)
    return `rgb(${r}, ${g}, ${b})`
  }

  useEffect(() => {
    // Check user preference for reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotionRef.current = mediaQuery.matches

    if (prefersReducedMotionRef.current) {
      setProgress(100)
      animationCompleteRef.current = true
    } else {
      // Track 1: Eased progress counter (1400ms)
      const duration = 1400
      const startTime = performance.now()

      const animate = (now: number) => {
        const elapsed = now - startTime
        const t = Math.min(elapsed / duration, 1)
        // Cubic easeOut: 1 - (1 - t)^3
        const easeOutVal = 1 - Math.pow(1 - t, 3)
        setProgress(easeOutVal * 100)

        if (t < 1) {
          requestAnimationFrame(animate)
        } else {
          animationCompleteRef.current = true
        }
      }
      requestAnimationFrame(animate)
    }

    // Track 2: Page load listener
    if (document.readyState === 'complete') {
      pageReadyRef.current = true
    } else {
      const handleLoad = () => {
        pageReadyRef.current = true
      }
      window.addEventListener('load', handleLoad)
      return () => window.removeEventListener('load', handleLoad)
    }
  }, [])

  // Poll for completion to dismiss loader
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (animationCompleteRef.current && pageReadyRef.current) {
        setIsDismissed(true)
        clearInterval(checkInterval)
      }
    }, 100)

    return () => clearInterval(checkInterval)
  }, [])

  // Handle final DOM removal after fade transition
  useEffect(() => {
    if (isDismissed) {
      const duration = prefersReducedMotionRef.current ? 0 : 150
      const timeout = setTimeout(() => {
        setIsFullyRemoved(true)
      }, duration)
      return () => clearTimeout(timeout)
    }
  }, [isDismissed])

  if (isFullyRemoved) return null

  const toothPath = "M60 8 C44 8, 28 16, 22 30 C16 44, 18 58, 20 68 C22 78, 24 88, 26 102 C28 116, 32 148, 38 148 C44 148, 46 128, 52 118 C55 112, 58 110, 60 110 C62 110, 65 112, 68 118 C74 128, 76 148, 82 148 C88 148, 92 116, 94 102 C96 88, 98 78, 100 68 C102 58, 104 44, 98 30 C92 16, 76 8, 60 8Z"

  return (
    <>
      <style>{`
        @keyframes shine {
          0% { opacity: 0; }
          50% { opacity: 0.6; }
          100% { opacity: 0; }
        }
        .tooth-shine {
          animation: shine 500ms ease-in-out forwards;
        }
      `}</style>
      <div 
        className={`fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center transition-opacity duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isDismissed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        style={prefersReducedMotionRef.current && isDismissed ? { display: 'none' } : undefined}
      >
        <div className="flex flex-col items-center">
          <svg 
            viewBox="0 0 120 160" 
            width={100} 
            height={133}
            className="overflow-visible"
          >
            <defs>
              <clipPath id="tooth-clip">
                <path d={toothPath} />
              </clipPath>
            </defs>
            
            {/* Outline Path */}
            <path 
              d={toothPath} 
              stroke="#2E5CA9" 
              strokeWidth={3} 
              fill="none" 
            />

            {/* Filled Rectangle inside ClipPath */}
            <rect 
              x={0} 
              y={fillY} 
              width={120} 
              height={fillHeight} 
              fill={getFillColor(progress)}
              clipPath="url(#tooth-clip)"
            />

            {/* Shine Ellipse effect */}
            {progress >= 100 && (
              <ellipse 
                cx={44} 
                cy={28} 
                rx={6} 
                ry={4} 
                fill="#FFFFFF" 
                className="tooth-shine"
                opacity={0}
              />
            )}
          </svg>
          
          <p className="mt-5 text-[14px] text-ink-muted font-body">
            Loading your dental guide...
          </p>
        </div>
      </div>
    </>
  )
}
