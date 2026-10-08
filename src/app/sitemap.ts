import type { MetadataRoute } from 'next'
import { getArticles } from '@/lib/content'
import { getSiteUrl } from '@/lib/seo'

export const revalidate = 60
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getSiteUrl()
  const routes = ['/', '/about', '/founder', '/learning', '/programs', '/outreach', '/impact', '/partnerships', '/consultation', '/contact']
  const articles = await getArticles()
  return [...routes.map(route => ({ url: origin + route })), ...articles.map(article => ({ url: origin + '/learning/' + article.slug.current, ...(article.publishedAt ? { lastModified: new Date(article.publishedAt) } : {}) }))]
}
