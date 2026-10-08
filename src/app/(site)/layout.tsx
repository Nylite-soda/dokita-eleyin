// src/app/(site)/layout.tsx
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getSiteSettings } from '@/lib/content'

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSiteSettings()
  return (
    <>
      <a href="#main-content" className="fixed left-4 top-4 z-[120] -translate-y-24 rounded-xl bg-white px-5 py-3 font-semibold text-brand-navy shadow-lg transition-transform focus:translate-y-0">Skip to main content</a>
      <Navbar socialHandles={settings?.socialHandles} />
      <main id="main-content" tabIndex={-1} className="flex-grow outline-none scroll-mt-28">
        {children}
      </main>
      <Footer settings={settings} />
    </>
  )
}

