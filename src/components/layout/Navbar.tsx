// src/components/layout/Navbar.tsx
'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { IconMenu2, IconX, IconBrandInstagram, IconBrandTiktok } from '@tabler/icons-react'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const navLinks = [
    { label: 'Learning Hub', href: '/learning' },
    { label: 'Programs', href: '/programs' },
    { label: 'Outreach', href: '/outreach' },
    { label: 'About', href: '/about' },
    { label: 'Impact', href: '/impact' },
  ]

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300 px-8 py-4 md:px-12",
      isScrolled 
        ? "bg-white/90 backdrop-blur-md shadow-lg py-3" 
        : isHome ? "bg-transparent py-6" : "bg-white shadow-sm"
    )}>
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 group relative z-50">
          <div className="h-10 w-auto relative transform group-hover:rotate-2 transition-transform">
            {/* 
              logo-horizontal-color.svg (76) - Default for light bg
              logo-horizontal-white-tagline.svg (74) - Dark/transparent bg
            */}
            <img 
              src={isScrolled || !isHome || isMobileMenuOpen ? "/logos/logo-horizontal-color.svg" : "/logos/logo-horizontal-white-tagline.svg"} 
              alt="Dókítà Eléyín Logo" 
              className="h-full w-auto" 
            />
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex space-x-8 items-center font-body font-medium">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={cn(
                "transition-all hover:text-brand-lightBlue relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-brand-lightBlue after:transition-all hover:after:w-full",
                isScrolled || !isHome ? "text-ink/70" : "text-white/90"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link 
            href="/consultation" 
            className={cn(
              "px-8 py-2.5 rounded-full font-bold transition-all transform active:scale-95 shadow-md hover:shadow-lg",
              isScrolled || !isHome 
                ? "bg-brand-darkBlue text-white hover:bg-brand-navy" 
                : "bg-white text-brand-darkBlue hover:bg-brand-lightBlue hover:text-brand-navy"
            )}
          >
            Book a Consultation
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden relative z-50 p-2"
        >
           {isMobileMenuOpen ? (
             <IconX className="text-brand-navy" size={28} />
           ) : (
             <IconMenu2 className={cn(
               isScrolled || !isHome ? "text-brand-navy" : "text-white"
             )} size={28} />
           )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-white z-40 lg:hidden flex flex-col pt-32 px-8 pb-12"
          >
            <div className="flex flex-col space-y-8 text-center">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link 
                    href={link.href} 
                    className="text-3xl font-display font-bold text-brand-navy hover:text-brand-lightBlue transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="pt-8"
              >
                <Link 
                  href="/consultation" 
                  className="inline-block w-full bg-brand-darkBlue text-white text-xl py-5 rounded-[2rem] font-bold shadow-xl"
                >
                  Book a Consultation
                </Link>
              </motion.div>
            </div>
            
            <div className="mt-auto pt-12 text-center border-t border-surface-card">
              <p className="text-sm font-body text-ink/40 mb-4">Follow our journey</p>
              <div className="flex justify-center gap-6 text-brand-darkBlue">
                 <IconBrandInstagram size={28} />
                 <IconBrandTiktok size={28} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

