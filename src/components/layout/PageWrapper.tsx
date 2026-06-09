// src/components/layout/PageWrapper.tsx
import { ReactNode } from 'react'

interface PageWrapperProps {
  children: ReactNode
}

export default function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className="max-w-4xl mx-auto px-8 sm:px-8 lg:px-8">
      {children}
    </div>
  )
}

