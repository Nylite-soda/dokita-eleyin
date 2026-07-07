// src/components/layout/Navbar.tsx
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { IconMenu2, IconX, IconBrandInstagram, IconBrandTiktok, IconChevronRight } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

let hasAnimated = false

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Learning Hub', href: '/learning' },
  { label: 'Programs', href: '/programs' },
  { label: 'Outreach', href: '/outreach' },
  { label: 'About', href: '/about' },
  { label: 'Impact', href: '/impact' },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [logoShouldPulse, setLogoShouldPulse] = useState(false)
  const pathname = usePathname()
  const shouldReduceMotion = useReducedMotion()
  const isHome = pathname === '/'

  const dynamicLinks = NAV_LINKS

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
    document.body.style.overflow = 'auto'
  }, [pathname])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    document.body.style.overflow = isMobileMenuOpen ? 'auto' : 'hidden'
  }

  // Determine navbar theme
  const isTransparent = isHome && !isScrolled && !isMobileMenuOpen
  const navTheme = isTransparent ? 'dark' : 'light'

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500",
        isScrolled ? "py-3" : "py-5"
      )}
    >
      <div className="max-w-6xl mx-auto px-8">
        <motion.nav 
          initial={hasAnimated || shouldReduceMotion ? { y: 0, opacity: 1 } : { y: -64, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={
            hasAnimated || shouldReduceMotion
              ? { duration: 0 }
              : { duration: 0.5, delay: 1.5, ease: [0.25, 0.1, 0.25, 1] }
          }
          onAnimationComplete={() => {
            if (!hasAnimated) {
              setLogoShouldPulse(true)
              hasAnimated = true
            }
          }}
          className={cn(
            "relative flex items-center justify-between transition-all duration-500 rounded-[2rem] px-6 py-2",
            isScrolled 
              ? "bg-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/20" 
              : "bg-transparent"
          )}
        >
          {/* Brand/Logo */}
          <NavBrand theme={navTheme} isScrolled={isScrolled} shouldPulse={logoShouldPulse} />
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <div className="flex items-center px-4 py-1.5 rounded-full bg-black/5 backdrop-blur-sm mr-4 border border-white/10">
              {dynamicLinks.map((link) => (
                <NavLink 
                  key={link.href} 
                  {...link} 
                  isActive={pathname === link.href}
                  theme={navTheme}
                />
              ))}
            </div>
            
            <Link 
              href="/consultation" 
              className={cn(
                "px-8 py-2.5 rounded-full font-bold text-sm transition-all duration-300 transform active:scale-95 shadow-lg",
                navTheme === 'dark' 
                  ? "bg-white text-brand-navy hover:bg-brand-lightBlue hover:text-brand-navy" 
                  : "bg-brand-darkBlue text-white hover:bg-brand-navy shadow-brand-darkBlue/20"
              )}
            >
              Book Consultation
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button 
            onClick={toggleMobileMenu}
            className={cn(
              "lg:hidden p-2 rounded-xl transition-colors relative z-50",
              navTheme === 'dark' ? "text-white hover:bg-white/10" : "text-brand-navy hover:bg-brand-navy/5"
            )}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
          </button>
        </motion.nav>
      </div>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileMenu 
            isOpen={isMobileMenuOpen} 
            onClose={toggleMobileMenu} 
            links={dynamicLinks} 
            activePath={pathname} 
          />
        )}
      </AnimatePresence>
    </header>
  )
}

function NavBrand({ 
  theme, 
  isScrolled, 
  shouldPulse 
}: { 
  theme: 'light' | 'dark'
  isScrolled: boolean
  shouldPulse?: boolean 
}) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <Link href="/" className="relative z-50 flex items-center transition-transform hover:scale-[1.02] active:scale-[0.98]">
      <motion.div 
        animate={shouldPulse && !shouldReduceMotion ? { scale: [1, 1.06, 1] } : { scale: 1 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="h-7 md:h-9 w-auto relative"
      >
        <img 
          src={theme === 'dark' ? "/logos/logo-horizontal-white-tagline.svg" : "/logos/logo-horizontal-color.svg"} 
          alt="Dókítà Eléyín" 
          className="h-full w-auto object-contain transition-all duration-300"
        />
      </motion.div>
    </Link>
  )
}

function NavLink({ label, href, isActive, theme }: { label: string, href: string, isActive: boolean, theme: 'light' | 'dark' }) {
  return (
    <Link 
      href={href} 
      className={cn(
        "relative px-4 py-2 text-sm font-medium transition-colors duration-300 group",
        isActive 
          ? (theme === 'dark' ? "text-brand-lightBlue" : "text-brand-darkBlue")
          : (theme === 'dark' ? "text-white/80 hover:text-white" : "text-brand-navy/70 hover:text-brand-navy")
      )}
    >
      <span className="relative z-10">{label}</span>
      {isActive && (
        <motion.span 
          layoutId="activeNav"
          className={cn(
            "absolute inset-0 rounded-full z-0 shadow-sm",
            theme === 'dark' ? "bg-white/10" : "bg-white"
          )}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </Link>
  )
}

function MobileMenu({ isOpen, onClose, links, activePath }: { isOpen: boolean, onClose: () => void, links: any[], activePath: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-brand-navy z-[90] lg:hidden overflow-hidden"
    >
      {/* Close Button Inside Menu */}
      <button 
        onClick={onClose}
        className="absolute top-8 right-6 text-white/70 hover:text-white p-2 z-[100]"
      >
        <IconX size={32} />
      </button>

      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-lightBlue rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-cyan rounded-full blur-[120px]" />
      </div>

      <div className="h-full flex flex-col px-8 pt-20 pb-12 relative z-10">
        <div className="flex flex-col space-y-2">
          {links.map((link, i) => (
            <motion.div
              key={link.href}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.1 }}
            >
              <Link 
                href={link.href}
                className={cn(
                  "flex items-center justify-between group py-3 border-b border-white/5",
                  activePath === link.href ? "text-brand-lightBlue" : "text-white"
                )}
              >
                <span className={cn(
                  "text-2xl font-display font-bold transition-colors",
                  activePath === link.href ? "text-brand-lightBlue" : "group-hover:text-brand-lightBlue"
                )}>
                  {link.label}
                </span>
                <IconChevronRight 
                  className={cn(
                    "transform transition-all",
                    activePath === link.href ? "text-brand-lightBlue translate-x-1" : "text-white/20 group-hover:text-brand-lightBlue group-hover:translate-x-1"
                  )} 
                  size={24} 
                />
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-auto space-y-8"
        >
          <Link 
            href="/consultation" 
            className="flex items-center justify-center w-full bg-white text-brand-navy text-xl py-5 rounded-[2rem] font-bold shadow-xl shadow-black/20 hover:bg-brand-lightBlue transition-colors active:scale-[0.98] transition-transform"
          >
            Book a Consultation
          </Link>

          <div className="text-center">
            <p className="text-sm font-body text-white/40 mb-6 uppercase tracking-widest">Follow our journey</p>
            <div className="flex justify-center gap-8 text-white/60">
               <a href="#" className="hover:text-brand-lightBlue transition-colors"><IconBrandInstagram size={32} /></a>
               <a href="#" className="hover:text-brand-lightBlue transition-colors"><IconBrandTiktok size={32} /></a>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}