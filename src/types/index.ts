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
