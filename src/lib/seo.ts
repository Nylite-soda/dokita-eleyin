import type { Metadata } from 'next'
import { getSiteSettings } from './content'
import { getContentImageUrl } from './content-image'

export const DEFAULT_SITE_NAME = 'Dókítà Eléyín'
export function getSiteUrl(): string {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000')
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Invalid website URL')
    return url.origin
  } catch { return 'http://localhost:3000' }
}
export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  const url = new URL(path, getSiteUrl()).href
  return { title, description, alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website', images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: DEFAULT_SITE_NAME }] },
    twitter: { card: 'summary_large_image', title, description, images: ['/og-default.jpg'] } }
}
export async function getSharedMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const siteName = settings?.siteName || DEFAULT_SITE_NAME
  const description = settings?.footerDescription || 'Making oral health knowledge simple, accessible, and actionable for healthier communities.'
  const image = getContentImageUrl(settings?.defaultOgImage) || '/og-default.jpg'
  return {
    metadataBase: new URL(getSiteUrl()),
    title: { default: siteName + ' — ' + (settings?.siteTagline || 'Dental Health Education & Outreach'), template: '%s | ' + siteName },
    description, alternates: { canonical: '/' },
    openGraph: { title: siteName, description, url: getSiteUrl(), siteName, images: [{ url: image, width: 1200, height: 630, alt: siteName }], locale: 'en_NG', type: 'website' },
    twitter: { card: 'summary_large_image', title: siteName, description, images: [image] },
    icons: { icon: '/favicon-32x32.png', apple: '/apple-touch-icon.png' }, manifest: '/site.webmanifest',
  }
}
