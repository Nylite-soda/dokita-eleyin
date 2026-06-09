// src/lib/seo.ts
import { Metadata } from 'next'
import { client } from './sanity.client'
import { siteSettingsQuery } from './sanity.queries'
import { urlForImage } from './sanity.image'

export async function getSharedMetadata(): Promise<Metadata> {
  const settings = await client.fetch(siteSettingsQuery)
  
  const siteName = settings?.siteName || 'Dókítà Eléyín'
  const siteTagline = settings?.siteTagline || 'Dental Health Education & Outreach'
  const description = settings?.footerDescription || 'Making oral health knowledge simple, accessible, and actionable for healthier communities.'
  
  const ogImage = settings?.defaultOgImage 
    ? urlForImage(settings.defaultOgImage).width(1200).height(630).url()
    : '/og-default.jpg'

  return {
    title: {
      default: `${siteName} — ${siteTagline}`,
      template: `%s | ${siteName}`
    },
    description,
    openGraph: {
      title: siteName,
      description,
      url: process.env.NEXT_PUBLIC_SITE_URL,
      siteName: siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: siteName,
      description,
      images: [ogImage],
    },
    icons: {
      icon: '/favicon-32x32.png',
      apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
  }
}
