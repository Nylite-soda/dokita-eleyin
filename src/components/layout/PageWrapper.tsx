// src/components/layout/PageWrapper.tsx
import { ReactNode } from 'react'

interface PageWrapperProps {
  children: ReactNode
}

export default function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className="max-w-6xl mx-auto px-6 md:px-12">
      {children}
    </div>
  )
}

