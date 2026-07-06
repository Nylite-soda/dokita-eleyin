// src/types/index.ts

export interface SocialLinks {
  instagram?: string
  tiktok?: string
  linkedin?: string
  twitter?: string
}

export interface Founder {
  _id: string
  fullName: string
  credentials?: string[]
  photo: any
  bio: any
  shortBio?: string
  socialLinks?: SocialLinks
  featuredQuote?: string
}

export interface Article {
  _id: string
  title: string
  slug: { current: string }
  excerpt: string
  body: any
  category?: { name: string, slug: { current: string } }
  featuredImage: any
  publishedAt: string
  isFeatured?: boolean
}

export interface SanityImageObject {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
  alt?: string
}

export interface Program {
  _id: string
  name: string
  slug: { current: string }
  shortDescription?: string
  fullDescription: any[]
  type: 'school' | 'outreach' | 'digital'
  images?: SanityImageObject[]
  activities?: string[]
  status?: 'active' | 'completed' | 'upcoming'
}

export interface FAQ {
  _id: string
  question: string
  answer: any[]
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

export interface Partner {
  _id: string
  name: string
  logo: SanityImageObject
  website?: string
  type?: 'school' | 'ngo' | 'corporate' | 'healthcare' | 'government'
  description?: string
  isActive: boolean
}

export interface OutreachEvent {
  _id: string
  name: string
  date: string
  location: string
  venueType?: 'school' | 'church' | 'community' | 'hospital' | 'other'
  description?: string
  images?: SanityImageObject[]
  peopleReached?: number
  isFeatured: boolean
  mapUrl?: string
}
