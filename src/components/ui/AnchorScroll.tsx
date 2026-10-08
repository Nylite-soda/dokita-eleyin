'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

function scrollToCurrentHash(focusTarget: boolean) {
  const hash = window.location.hash
  if (!hash || hash === '#') return false

  let id = hash.slice(1)
  try { id = decodeURIComponent(id) } catch { /* Keep the literal fragment. */ }
  const target = document.getElementById(id)
  if (!target) return false

  target.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    block: 'start',
  })
  if (target instanceof HTMLElement && !target.matches('a, button, input, select, textarea, [tabindex]')) {
    target.setAttribute('tabindex', '-1')
    target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true })
  }
  if (focusTarget && target instanceof HTMLElement) target.focus({ preventScroll: true })
  return true
}

/** Reapply fragment navigation after client-side routes and streamed content settle. */
export default function AnchorScroll() {
  const pathname = usePathname()
  const pendingFocus = useRef(false)

  useEffect(() => {
    let stopped = false
    let attempts = 0
    let timer: ReturnType<typeof setTimeout> | undefined
    const retry = () => {
      if (stopped || !window.location.hash) return
      if (scrollToCurrentHash(pendingFocus.current)) { pendingFocus.current = false; return }
      if (attempts++ >= 30) { pendingFocus.current = false; return }
      timer = setTimeout(retry, 50)
    }
    const onHashChange = () => { attempts = 0; retry() }
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const anchor = (event.target as Element | null)?.closest('a[href]')
      if (!(anchor instanceof HTMLAnchorElement)) return
      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin || !url.hash) return
      pendingFocus.current = true

      // Same-page anchors can be handled immediately, including when a browser
      // would otherwise retain a stale position after a repeated click.
      if (url.pathname === window.location.pathname) {
        if (url.search === window.location.search) {
          event.preventDefault()
          if (url.hash !== window.location.hash) window.history.pushState(null, '', url)
        }
        attempts = 0
        timer = setTimeout(retry, 0)
      }
    }

    window.addEventListener('hashchange', onHashChange)
    document.addEventListener('click', onClick)
    // Route changes can render the destination after the URL has already changed.
    attempts = 0
    retry()
    return () => {
      stopped = true
      if (timer) clearTimeout(timer)
      window.removeEventListener('hashchange', onHashChange)
      document.removeEventListener('click', onClick)
    }
  }, [pathname])

  return null
}
