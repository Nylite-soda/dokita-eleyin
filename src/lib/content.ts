import 'server-only'
import { cache } from 'react'
import { prisma } from './prisma'
import * as schemas from './content.schemas'
import type { Article, Category, FAQ, Founder, HomepageSettings, ImpactData, OutreachEvent, Partner, Program, SiteSettings } from '@/types'

type RawDocument = Record<string, unknown> & { _id: string }
const documents = cache(async (type: string): Promise<RawDocument[]> => {
  try {
    const rows = await prisma.cms_documents.findMany({ where: { type, status: 'published' }, orderBy: { updated_at: 'desc' } })
    return rows.flatMap(row => {
      const content = row.published_data ?? row.data
      try {
        const value: unknown = JSON.parse(content)
        return typeof value === 'object' && value !== null && !Array.isArray(value) ? [{ ...value, _id: row.id }] : []
      } catch { return [] }
    })
  } catch {
    console.warn('[content] Local content could not be read; rendering available page content.')
    return []
  }
})
function parse<T>(schema: { safeParse: (value: unknown) => { success: true; data: T } | { success: false } }, value: unknown, fallback: T): T {
  const result = schema.safeParse(value)
  return result.success ? result.data : fallback
}
function referenceId(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (!value || typeof value !== 'object') return undefined
  if ('_ref' in value && typeof value._ref === 'string') return value._ref
  if ('_id' in value && typeof value._id === 'string') return value._id
  return undefined
}
const singleton = async (type: string) => (await documents(type))[0] ?? null
export const getSiteSettings = cache(async (): Promise<SiteSettings | null> => parse(schemas.settingsSchema.nullable(), singleton('siteSettings'), null))
export const getFounder = cache(async (): Promise<Founder | null> => parse(schemas.founderSchema.nullable(), singleton('founder'), null))
export const getCategories = cache(async (): Promise<Category[]> => parse(schemas.listSchema(schemas.categorySchema), await documents('category'), []))
export const getArticles = cache(async (): Promise<Article[]> => {
  const categories = await getCategories()
  const raw = (await documents('article')).map(article => {
    const categoryId = referenceId(article.category)
    return { ...article, category: categoryId ? categories.find(category => category._id === categoryId) : article.category }
  })
  return parse(schemas.listSchema(schemas.articleSchema), raw, []).sort((a,b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))
})
export const getArticle = cache(async (slug: string): Promise<Article | null> => {
  const articles = await getArticles()
  const article = articles.find(item => item.slug.current === slug)
  if (!article) return null
  return { ...article, relatedArticles: articles.filter(item => item._id !== article._id && item.category?._id === article.category?._id).slice(0,3) }
})
export const getArticleSlugs = cache(async (): Promise<string[]> => (await getArticles()).map(article => article.slug.current))
export const getHomepage = cache(async (): Promise<HomepageSettings | null> => {
  const raw = await singleton('homepageSettings')
  if (!raw) return null
  const articles = await getArticles()
  const featured = Array.isArray(raw.featuredArticles) ? raw.featuredArticles.flatMap(value => {
    const article = articles.find(item => item._id === referenceId(value))
    return article ? [article] : []
  }) : articles.filter(article => article.isFeatured).slice(0,3)
  return parse(schemas.homepageSchema, { ...raw, featuredArticles: featured }, null)
})
export const getPrograms = cache(async (): Promise<Program[]> => parse(schemas.listSchema(schemas.programSchema), await documents('program'), []))
export const getOutreachEvents = cache(async (): Promise<OutreachEvent[]> => parse(schemas.listSchema(schemas.outreachSchema), await documents('outreachEvent'), []).sort((a,b)=>(b.date ?? '').localeCompare(a.date ?? '')))
export const getPartners = cache(async (): Promise<Partner[]> => parse(schemas.listSchema(schemas.partnerSchema), await documents('partner'), []).filter(partner=>partner.isActive))
export const getImpact = cache(async (): Promise<ImpactData> => {
  const [rawStats, rawStories, outreach] = await Promise.all([documents('impactStat'), documents('impactStory'), documents('outreachEvent')])
  const stats = parse(schemas.listSchema(schemas.statSchema), rawStats, []).sort((a,b)=>(a.sortOrder ?? 0)-(b.sortOrder ?? 0))
  const stories = parse(schemas.listSchema(schemas.storySchema), rawStories, [])
  return { stats, stories, outreachCount: outreach.length }
})
export const getFAQs = cache(async (category?: FAQ['category']): Promise<FAQ[]> => {
  const faqs = parse(schemas.listSchema(schemas.faqSchema), await documents('faq'), []).sort((a,b)=>(a.sortOrder ?? 0)-(b.sortOrder ?? 0))
  return category ? faqs.filter(faq => faq.category === category || faq.category === 'general') : faqs
})
