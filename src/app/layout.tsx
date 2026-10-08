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
      <head>
        <link rel="preload" href="/fonts/VisbyCF-Medium.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Fredoka-Latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="font-body text-ink bg-surface antialiased flex flex-col min-h-screen">
        {children}
      </body>
    </html>
  )
}
