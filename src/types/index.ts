import type { PortableTextBlock } from '@portabletext/types'

export interface SocialLinks {
  instagram?: string
  tiktok?: string
  youtube?: string
  linkedin?: string
  twitter?: string
}
export interface SanityImageObject {
  _type: 'image'
  _key?: string
  asset: { _ref?: string; url?: string; _type?: 'reference' }
  alt?: string
  caption?: string
  crop?: { top: number; bottom: number; left: number; right: number }
  hotspot?: { x: number; y: number; width: number; height: number }
}
export type PortableTextContent = (PortableTextBlock | SanityImageObject)[]
export type ImageObject = SanityImageObject
export interface Category { _id: string; name: string; slug: { current: string } }
export interface Founder {
  _id: string
  fullName: string
  credentials?: string[]
  photo?: SanityImageObject
  bio?: PortableTextContent
  shortBio?: string
  socialLinks?: SocialLinks
  featuredQuote?: string
}
export interface Article {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  body?: PortableTextContent
  category?: Category
  featuredImage?: SanityImageObject
  publishedAt?: string
  isFeatured?: boolean
  seoTitle?: string
  seoDescription?: string
  relatedArticles?: Article[]
}
export interface Program {
  _id: string
  name: string
  slug?: { current: string }
  shortDescription?: string
  fullDescription?: PortableTextContent
  type?: 'school' | 'outreach' | 'digital'
  images?: SanityImageObject[]
  activities?: string[]
  status?: 'active' | 'completed' | 'upcoming'
}
export interface FAQ {
  _id: string
  question: string
  answer: PortableTextContent
  category?: 'general' | 'consultation' | 'programs' | 'partnerships'
  sortOrder?: number
}
export interface ImpactStat {
  _id: string
  label: string
  value: number
  icon?: string
  sortOrder?: number
}
export interface ImpactStory {
  _id: string
  name: string
  role?: string
  location?: string
  photo?: SanityImageObject
  story?: PortableTextContent
  isFeatured?: boolean
}
export interface ImpactData { stats: ImpactStat[]; stories: ImpactStory[]; outreachCount: number }
export interface Partner {
  _id: string
  name: string
  logo?: SanityImageObject
  website?: string
  type?: 'school' | 'ngo' | 'corporate' | 'healthcare' | 'government'
  description?: string
  isActive: boolean
}
export interface OutreachEvent {
  _id: string
  name: string
  date?: string
  location?: string
  venueType?: 'school' | 'church' | 'community_centre' | 'community' | 'hospital' | 'other'
  description?: string
  images?: SanityImageObject[]
  peopleReached?: number
  isFeatured?: boolean
  mapUrl?: string
}
export interface HomepageSettings {
  heroHeadline?: string
  heroSubheadline?: string
  heroPrimaryCTA?: { label?: string; link?: string }
  heroSecondaryCTA?: { label?: string; link?: string }
  heroImage?: SanityImageObject
  tagline?: string
  whyWeExistTitle?: string
  whyWeExistBody?: string
  featuredArticles?: Article[]
  socialProofText?: string
  newsletterHeadline?: string
  newsletterSubcopy?: string
  socialFeedEmbed?: string
  socialLinks?: SocialLinks
}
export interface SiteSettings {
  siteName?: string
  siteTagline?: string
  defaultOgImage?: SanityImageObject
  contactEmail?: string
  contactPhone?: string
  address?: string
  socialHandles?: SocialLinks
  footerDescription?: string
  mission?: string
  vision?: string
  coreValues?: { title: string; description?: string; desc?: string }[]
  cookieNotice?: string
  bookingLink?: string
  bookingSummary?: string
  consultationPrice?: string
  consultationDuration?: string
}
