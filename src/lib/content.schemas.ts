import { z } from 'zod'
import type { PortableTextBlock } from '@portabletext/types'
import type { Article } from '@/types'

const text = z.string().trim().optional().catch(undefined)
const id = z.string().min(1)
const slug = z.object({ current: z.string().min(1) })
const date = z.string().refine(value => !Number.isNaN(Date.parse(value))).optional().catch(undefined)
const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

export const imageSchema = z.object({
  _type: z.literal('image').default('image'),
  _key: text,
  asset: z.object({ _ref: z.string().optional(), url: z.string().regex(/^\/media\/[a-zA-Z0-9-]+$/).optional(), _type: z.literal('reference').optional() }).refine(asset => Boolean(asset.url || asset._ref)),
  alt: text,
  caption: text,
  crop: z.object({ top: z.number(), bottom: z.number(), left: z.number(), right: z.number() }).optional().catch(undefined),
  hotspot: z.object({ x: z.number(), y: z.number(), width: z.number(), height: z.number() }).optional().catch(undefined),
})
const optionalImage = imageSchema.optional().catch(undefined)
const block = z.custom<PortableTextBlock>(value => record(value) && value._type === 'block' && Array.isArray(value.children) && value.children.every(child => record(child) && typeof child._type === 'string' && (child._type !== 'span' || typeof child.text === 'string')))

/** Keep valid entries when an editor leaves a reference empty or old data is malformed. */
export function listSchema<T>(item: z.ZodType<T>) {
  return z.preprocess(value => Array.isArray(value) ? value.flatMap(entry => {
    const parsed = item.safeParse(entry)
    return parsed.success ? [parsed.data] : []
  }) : [], z.array(item))
}
const richText = listSchema(z.union([block, imageSchema])).optional()
const social = z.object({ instagram: text, tiktok: text, youtube: text, linkedin: text, twitter: text, facebook: text }).optional().catch(undefined)

export const categorySchema = z.object({ _id: id, name: z.string().min(1), slug })
const articleBase = z.object({
  _id: id, title: z.string().min(1), slug, excerpt: text, body: richText,
  category: categorySchema.optional().catch(undefined), featuredImage: optionalImage,
  publishedAt: date, isFeatured: z.boolean().optional().catch(undefined), seoTitle: text, seoDescription: text,
})
export const articleSchema: z.ZodType<Article> = articleBase.extend({ relatedArticles: listSchema(articleBase).optional() })
export const founderSchema = z.object({
  _id: id, fullName: z.string().min(1), title: text, credentials: listSchema(z.string()).optional(), photo: optionalImage,
  bio: richText, shortBio: text, socialLinks: social, featuredQuote: text, additionalQuote: text,
})
export const programSchema = z.object({
  _id: id, name: z.string().min(1), slug: slug.optional().catch(undefined), shortDescription: text,
  fullDescription: richText, type: z.enum(['school', 'outreach', 'digital']).optional().catch(undefined),
  images: listSchema(imageSchema).optional(), activities: listSchema(z.string()).optional(),
  status: z.enum(['active', 'completed', 'upcoming']).optional().catch(undefined),
})
export const outreachSchema = z.object({
  _id: id, name: z.string().min(1), date, location: text,
  venueType: z.enum(['school', 'church', 'community_centre', 'community', 'hospital', 'other']).optional().catch(undefined),
  description: text, images: listSchema(imageSchema).optional(), peopleReached: z.number().nonnegative().optional().catch(undefined),
  isFeatured: z.boolean().optional().catch(undefined), mapUrl: text,
})
export const partnerSchema = z.object({
  _id: id, name: z.string().min(1), logo: optionalImage, website: text,
  type: z.enum(['school', 'ngo', 'corporate', 'healthcare', 'government']).optional().catch(undefined),
  description: text, isActive: z.boolean().default(false),
})
export const statSchema = z.object({ _id: id, label: z.string().min(1), value: z.number().nonnegative(), suffix: text, icon: text, sortOrder: z.number().optional().catch(undefined) })
export const storySchema = z.object({ _id: id, name: z.string().min(1), role: text, location: text, photo: optionalImage, story: richText, isFeatured: z.boolean().optional() })
export const impactSchema = z.object({ stats: listSchema(statSchema), stories: listSchema(storySchema), outreachCount: z.number().nonnegative().default(0) })
export const faqSchema = z.object({ _id: id, question: z.string().min(1), answer: richText.default([]), category: z.enum(['general', 'consultation', 'programs', 'partnerships']).optional().catch(undefined), sortOrder: z.number().optional() })
export const homepageSchema = z.object({
  heroHeadline: text, heroSubheadline: text,
  heroPrimaryCTA: z.object({ label: text, link: text }).optional().catch(undefined),
  heroSecondaryCTA: z.object({ label: text, link: text }).optional().catch(undefined),
  heroImage: optionalImage, tagline: text, whyWeExistTitle: text, whyWeExistBody: text,
  featuredArticles: listSchema(articleSchema).optional(), socialProofText: text,
  newsletterHeadline: text, newsletterSubcopy: text, socialFeedEmbed: text, socialLinks: social,
})
export const settingsSchema = z.object({
  siteName: text, siteTagline: text, defaultOgImage: optionalImage,
  contactEmail: z.email().optional().catch(undefined), contactPhone: text, address: text,
  socialHandles: social, footerDescription: text, mission: text, vision: text,
  coreValues: listSchema(z.object({ title: z.string().min(1), description: text, desc: text })).optional(),
  cookieNotice: text, bookingLink: text, bookingSummary: text, consultationPrice: text, consultationDuration: text,
})
