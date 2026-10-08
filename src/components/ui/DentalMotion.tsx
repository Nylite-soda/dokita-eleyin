import { useId } from 'react'

type DentalMotionVariant = 'molar' | 'brush' | 'paste'

interface DentalMotionProps {
  variant?: DentalMotionVariant
  label?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  decorative?: boolean
}

/** Lightweight, CSS/SVG dental motion. The artwork is decorative; the label is announced. */
export default function DentalMotion({ variant = 'molar', label = 'Loading', size = 'md', className = '', decorative = false }: DentalMotionProps) {
  const id = useId()
  return (
    <span className={`dental-motion dental-motion--${variant} dental-motion--${size} ${className}`} {...(decorative ? { 'aria-hidden': true } : { role: 'status', 'aria-live': 'polite' as const })}>
      {!decorative && <span className="sr-only">{label}</span>}
      <svg className="dental-motion__art" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={`${id}-enamel`} x1=".18" y1=".08" x2=".84" y2=".94">
            <stop stopColor="#bcefff" />
            <stop offset=".42" stopColor="#73c9ea" />
            <stop offset="1" stopColor="#347eae" />
          </linearGradient>
          <linearGradient id={`${id}-root`} x1=".2" y1="0" x2=".85" y2="1">
            <stop stopColor="#c9f1ff" />
            <stop offset="1" stopColor="#6cb9dc" />
          </linearGradient>
          <linearGradient id={`${id}-paste`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#fff" />
            <stop offset="1" stopColor="#91ecff" />
          </linearGradient>
          <filter id={`${id}-tooth-shadow`} x="-30%" y="-30%" width="160%" height="170%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0d2d5c" floodOpacity=".22" />
          </filter>
          <clipPath id={`${id}-tooth-clip`}>
            <path d="M30 47c0-15 10-24 23-24 8 0 12 4 17 4s9-4 17-4c13 0 23 9 23 24 0 12-5 19-9 27-5 10-6 25-13 25-8 0-6-22-16-22s-8 22-16 22c-7 0-8-15-13-25-4-8-13-15-13-27Z" />
          </clipPath>
        </defs>
        <g className="dental-motion__orbit" fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".4">
          <ellipse cx="60" cy="60" rx="52" ry="27" />
        </g>
        <g className="dental-motion__tooth" filter={`url(#${id}-tooth-shadow)`}>
          <g transform="translate(-10 0)">
            <path d="M30 47c0-15 10-24 23-24 8 0 12 4 17 4s9-4 17-4c13 0 23 9 23 24 0 12-5 19-9 27-5 10-6 25-13 25-8 0-6-22-16-22s-8 22-16 22c-7 0-8-15-13-25-4-8-13-15-13-27Z" fill="#e9faff" stroke="#2e5ca9" strokeWidth="2" />
            <rect className="dental-motion__tooth-fill" x="20" y="100" width="100" height="82" fill={`url(#${id}-enamel)`} clipPath={`url(#${id}-tooth-clip)`} />
            <path d="M35 47c0-11 7-18 16-18 5 0 9 3 13 5 4-2 8-5 13-5 9 0 16 7 16 18 0 8-4 15-8 22-4 8-5 15-8 20-2-9-6-15-13-15s-11 6-13 15c-3-5-4-12-8-20-4-7-8-14-8-22Z" fill={`url(#${id}-root)`} opacity=".58" />
            <path d="M42 42c2-7 7-10 13-10" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".9" />
            <circle cx="81" cy="42" r="2.5" fill="#fff" opacity=".9" />
          </g>
        </g>
        <path className="dental-motion__orbit-front" d="M8 60a52 27 0 0 0 104 0" fill="none" stroke="#1a3666" strokeWidth="3.2" strokeLinecap="round" />
        <g className="dental-motion__brush" strokeLinecap="round">
          <path d="M29 83 56 56" stroke="#55c9f4" strokeWidth="7" />
          <path d="m52 60 13-13" stroke="#fff" strokeWidth="9" />
          <path d="m54 57 11-11" stroke="#2e5ca9" strokeWidth="1.5" />
          <path d="m57 60 11-11" stroke="#2e5ca9" strokeWidth="1.5" />
        </g>
        <g className="dental-motion__tube">
          <path d="m22 75 17-17 11 11-17 17z" fill="#fff" stroke="#d8f5ff" strokeWidth="2" />
          <path d="m37 60 7-7 11 11-7 7z" fill="#55c9f4" />
          <path d="m26 79 8 8" stroke="#2e5ca9" strokeWidth="3" strokeLinecap="round" />
        </g>
        <path className="dental-motion__spark" d="m91 25 2.4 6.6L100 34l-6.6 2.4L91 43l-2.4-6.6L82 34l6.6-2.4z" fill="#73f8ff" />
        <path className="dental-motion__paste-mark" d="M24 103c12-9 23 9 36 0s24 9 37 0" fill="none" stroke={`url(#${id}-paste)`} strokeWidth="5" strokeLinecap="round" />
      </svg>
      {size === 'lg' && <span className="dental-motion__caption" aria-hidden="true">A little care is on the way</span>}
    </span>
  )
}
