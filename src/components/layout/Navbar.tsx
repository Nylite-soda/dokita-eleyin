'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconMenu2, IconX, IconBrandInstagram, IconBrandTiktok, IconBrandYoutube, IconBrandLinkedin, IconBrandX, IconChevronRight } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { getSocialLinks, type SocialHandles } from '@/lib/social'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Learning Hub', href: '/learning' },
  { label: 'Programs', href: '/programs' },
  { label: 'Outreach', href: '/outreach' },
  { label: 'About', href: '/about' },
  { label: 'Impact', href: '/impact' },
]
const MORE_LINKS = [
  { label: 'Meet the Founder', href: '/founder' },
  { label: 'Partnerships', href: '/partnerships' },
  { label: 'Contact', href: '/contact' },
]
const socialIcons = {
  instagram: IconBrandInstagram,
  tiktok: IconBrandTiktok,
  youtube: IconBrandYoutube,
  linkedin: IconBrandLinkedin,
  twitter: IconBrandX,
}

function isCurrentPath(pathname: string, href: string) {
  return pathname === href || (href !== '/' && pathname.startsWith(`${href}/`))
}

export default function Navbar({ socialHandles }: { socialHandles?: SocialHandles }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuPath, setMenuPath] = useState<string | null>(null)
  const pathname = usePathname()
  const isMenuOpen = menuPath === pathname
  const dialogRef = useRef<HTMLDialogElement>(null)
  const socialLinks = getSocialLinks(socialHandles)
  const isTransparent = pathname === '/' && !isScrolled && !isMenuOpen

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!isMenuOpen || !dialog) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Native modal dialogs make the rest of the document inert, trap focus,
    // and restore the opener's focus when closed.
    dialog.showModal()

    const desktop = window.matchMedia('(min-width: 1280px)')
    const handleResize = () => {
      if (desktop.matches) setMenuPath(null)
    }
    const handleHistoryNavigation = () => setMenuPath(null)
    desktop.addEventListener('change', handleResize)
    window.addEventListener('popstate', handleHistoryNavigation)

    return () => {
      desktop.removeEventListener('change', handleResize)
      window.removeEventListener('popstate', handleHistoryNavigation)
      dialog.close()
      document.body.style.overflow = previousOverflow
    }
  }, [isMenuOpen])

  const closeMenu = () => setMenuPath(null)

  return (
    <header className={cn('fixed inset-x-0 top-0 z-[100] transition-all duration-300', isScrolled ? 'py-3' : 'py-4')}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <nav aria-label="Primary navigation" className={cn('flex items-center justify-between gap-4 rounded-[2rem] px-3 py-2 sm:px-5', isScrolled && 'border border-white/30 bg-white/95 shadow-lg backdrop-blur-xl')}>
          <Link href="/" aria-label="Dókítà Eléyín home" className="shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-lightBlue">
            <Image src={isTransparent ? '/logos/logo-horizontal-white-tagline.svg' : '/logos/logo-horizontal-color.svg'} alt="Dókítà Eléyín" width={1082} height={175} className="h-7 w-auto sm:h-9" />
          </Link>

          <div className="hidden items-center gap-4 xl:flex">
            <div className={cn('flex items-center rounded-full p-1', isTransparent ? 'bg-white/10' : 'bg-brand-navy/5')}>
              {NAV_LINKS.map(({ label, href }) => {
                const active = isCurrentPath(pathname, href)
                return (
                  <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={cn('whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-lightBlue', isTransparent ? 'text-white hover:bg-white/10' : 'text-brand-navy hover:bg-white', active && (isTransparent ? 'bg-white/15' : 'bg-white text-brand-darkBlue shadow-sm'))}>
                    {label}
                  </Link>
                )
              })}
            </div>
            <Link href="/consultation" aria-current={pathname === '/consultation' ? 'page' : undefined} className={cn('whitespace-nowrap rounded-full px-5 py-3 text-sm font-bold shadow-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-lightBlue', isTransparent ? 'bg-white text-brand-navy hover:bg-brand-lightBlue' : 'bg-brand-darkBlue text-white hover:bg-brand-navy')}>
              Book Consultation
            </Link>
          </div>

          <button type="button" onClick={() => setMenuPath(pathname)} aria-label="Open navigation menu" aria-expanded={isMenuOpen} aria-controls="mobile-navigation" className={cn('rounded-xl p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-lightBlue xl:hidden', isTransparent ? 'text-white hover:bg-white/10' : 'text-brand-navy hover:bg-brand-navy/5')}>
            <IconMenu2 size={26} aria-hidden="true" />
          </button>
        </nav>
      </div>

      <dialog ref={dialogRef} id="mobile-navigation" aria-labelledby="mobile-navigation-title" aria-modal="true" onCancel={(event) => { event.preventDefault(); closeMenu() }} onClick={(event) => { if (event.target === event.currentTarget) closeMenu() }} className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto overscroll-contain border-0 bg-brand-navy p-0 text-white backdrop:bg-brand-navy/80">
        <div className="mx-auto flex min-h-full max-w-2xl flex-col px-6 pb-8 pt-5 sm:px-8">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 id="mobile-navigation-title" className="font-display text-xl font-semibold">Explore Dókítà Eléyín</h2>
            <button type="button" autoFocus aria-label="Close navigation menu" onClick={closeMenu} className="shrink-0 rounded-xl p-3 text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-brand-lightBlue">
              <IconX size={28} aria-hidden="true" />
            </button>
          </div>
          <nav aria-label="Mobile navigation" className="mb-6">
            {NAV_LINKS.map(({ label, href }) => {
              const active = isCurrentPath(pathname, href)
              return (
                <Link key={href} href={href} onClick={closeMenu} aria-current={active ? 'page' : undefined} className={cn('flex items-center justify-between rounded-lg border-b border-white/15 px-2 py-3 font-display text-xl font-medium hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-brand-lightBlue', active && 'text-brand-lightBlue')}>
                  {label}<IconChevronRight size={22} aria-hidden="true" />
                </Link>
              )
            })}
            <div className="mt-5 flex flex-wrap gap-3">
              {MORE_LINKS.map(({ label, href }) => (
                <Link key={href} href={href} onClick={closeMenu} aria-current={pathname === href ? 'page' : undefined} className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-brand-lightBlue">{label}</Link>
              ))}
            </div>
          </nav>
          <div className="mt-auto space-y-6">
            <Link href="/consultation" onClick={closeMenu} className="flex w-full items-center justify-center rounded-2xl bg-white px-4 py-4 text-lg font-bold text-brand-navy hover:bg-brand-lightBlue focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-lightBlue">Book a Consultation</Link>
            {socialLinks.length > 0 && (
              <div className="text-center">
                <p className="mb-3 text-sm text-blue-100">Follow our journey</p>
                <div className="flex justify-center gap-4">
                  {socialLinks.map(({ platform, label, url }) => {
                    const Icon = socialIcons[platform]
                    return <a key={platform} href={url} target="_blank" rel="noopener noreferrer" aria-label={`${label} (opens in a new tab)`} className="rounded-lg p-2 hover:text-brand-lightBlue focus-visible:outline-2 focus-visible:outline-brand-lightBlue"><Icon size={26} aria-hidden="true" /></a>
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </dialog>
    </header>
  )
}
