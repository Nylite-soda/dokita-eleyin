// src/lib/sanity.queries.ts
import { groq } from 'next-sanity'

export const homepageQuery = groq`
  *[_type == "homepageSettings"] | order(_updatedAt desc) [0] {
    ...,
    featuredArticles[]-> {
      title,
      slug,
      excerpt,
      category->,
      featuredImage,
      publishedAt
    }
  }
`

export const allArticlesQuery = groq`
  *[_type == "article"] | order(publishedAt desc) {
    title,
    slug,
    excerpt,
    category->,
    featuredImage,
    publishedAt
  }
`

export const articleBySlugQuery = groq`
  *[_type == "article" && slug.current == $slug][0] {
    ...,
    category->,
    "relatedArticles": *[_type == "article" && category->name == ^.category->name && _id != ^._id][0...3] {
      title,
      slug,
      excerpt,
      featuredImage,
      publishedAt
    }
  }
`

export const founderQuery = groq`*[_type == "founder"][0]`

export const impactPageQuery = groq`
  {
    "stats": *[_type == "impactStat"] | order(sortOrder asc),
    "stories": *[_type == "impactStory"] | order(_createdAt desc),
    "outreachCount": count(*[_type == "outreachEvent"])
  }
`

export const programsQuery = groq`*[_type == "program"] | order(name asc)`

export const outreachEventsQuery = groq`*[_type == "outreachEvent"] | order(date desc)`

export const partnersQuery = groq`*[_type == "partner" && isActive == true] | order(name asc)`

export const faqQuery = groq`*[_type == "faq"] | order(category asc, sortOrder asc)`

export const siteSettingsQuery = groq`*[_type == "siteSettings"][0]`
