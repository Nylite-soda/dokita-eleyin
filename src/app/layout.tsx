// src/app/layout.tsx
import { Metadata } from 'next'
import './globals.css'
import { getSharedMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  return await getSharedMetadata()
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-body text-ink bg-surface antialiased flex flex-col min-h-screen">
        {children}
      </body>
    </html>
  )
}
