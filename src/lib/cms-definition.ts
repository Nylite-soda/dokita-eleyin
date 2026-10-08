export type CmsFieldKind = 'text' | 'textarea' | 'richtext' | 'slug' | 'number' | 'boolean' | 'select' | 'strings' | 'json' | 'image' | 'images' | 'date' | 'reference'
export interface CmsField { key: string; label: string; kind: CmsFieldKind; required?: boolean; options?: string[]; help?: string }
export interface CmsDefinition { type: string; label: string; singular: string; singleton?: boolean; adminOnly?: boolean; fields: CmsField[] }
const field = (key: string, label: string, kind: CmsFieldKind = 'text', required = false, options?: string[]): CmsField => ({ key, label, kind, required, options })
const socials = (key: string) => ['instagram', 'tiktok', 'youtube', 'linkedin', 'twitter'].map(platform => field(`${key}.${platform}`, `${platform[0].toUpperCase()}${platform.slice(1)} handle or URL`))
export const CMS_DEFINITIONS: CmsDefinition[] = [
  { type: 'article', label: 'Articles', singular: 'Article', fields: [field('title','Title','text',true),field('slug','URL slug','slug',true),field('excerpt','Summary','textarea'),field('body','Article body','richtext',true),field('category','Category','reference'),field('featuredImage','Featured image','image'),field('tags','Tags','strings'),field('publishedAt','Article date','date'),field('isFeatured','Feature this article','boolean'),field('seoTitle','Search title'),field('seoDescription','Search description','textarea')] },
  { type: 'category', label: 'Categories', singular: 'Category', fields: [field('name','Name','text',true),field('slug','URL slug','slug',true)] },
  { type: 'program', label: 'Programs', singular: 'Program', fields: [field('name','Name','text',true),field('slug','URL slug','slug',true),field('shortDescription','Summary','textarea'),field('fullDescription','Description','richtext'),field('type','Program type','select',true,['school','outreach','digital']),field('status','Program status','select',false,['upcoming','active','completed']),field('activities','Activities','strings'),field('images','Images','images')] },
  { type: 'outreachEvent', label: 'Outreach', singular: 'Outreach event', fields: [field('name','Name','text',true),field('date','Event date','date',true),field('location','Location'),field('venueType','Venue type','select',false,['school','church','community_centre','hospital','other']),field('description','Description','textarea'),field('peopleReached','People reached (verified)','number'),field('images','Images','images'),field('mapUrl','Google Maps URL'),field('isFeatured','Featured','boolean')] },
  { type: 'impactStat', label: 'Impact statistics', singular: 'Impact statistic', fields: [field('label','Label','text',true),field('value','Verified value','number',true),field('icon','Icon','select',false,['users','schools','events','tooth','heart']),field('sortOrder','Display order','number')] },
  { type: 'impactStory', label: 'Community stories', singular: 'Community story', fields: [field('name','Name','text',true),field('role','Role'),field('location','Location'),field('photo','Portrait','image'),field('story','Story','richtext',true),field('isFeatured','Featured','boolean')] },
  { type: 'partner', label: 'Partners', singular: 'Partner', fields: [field('name','Name','text',true),field('logo','Logo','image'),field('website','Website URL'),field('type','Partner type','select',false,['school','ngo','corporate','healthcare','government']),field('description','Description','textarea'),field('isActive','Active partner','boolean')] },
  { type: 'faq', label: 'FAQs', singular: 'FAQ', fields: [field('question','Question','text',true),field('answer','Answer','richtext',true),field('category','Category','select',false,['general','consultation','programs','partnerships']),field('sortOrder','Display order','number')] },
  { type: 'founder', label: 'Founder profile', singular: 'Founder profile', singleton: true, fields: [field('fullName','Full name','text',true),field('credentials','Verified credentials','strings'),field('photo','Portrait','image'),field('shortBio','Short biography','textarea'),field('bio','Biography','richtext'),field('featuredQuote','Quote','textarea'),...socials('socialLinks')] },
  { type: 'homepageSettings', label: 'Homepage', singular: 'Homepage', singleton: true, fields: [field('heroHeadline','Headline'),field('heroSubheadline','Subheadline','textarea'),field('heroImage','Hero image','image'),field('heroPrimaryCTA.label','Primary button label'),field('heroPrimaryCTA.link','Primary button URL'),field('heroSecondaryCTA.label','Secondary button label'),field('heroSecondaryCTA.link','Secondary button URL'),field('tagline','Tagline'),field('whyWeExistTitle','Purpose heading'),field('whyWeExistBody','Purpose text','textarea'),field('featuredArticles','Featured article references','json'),field('socialProofText','Verified supporting claim'),field('newsletterHeadline','Newsletter heading'),field('newsletterSubcopy','Newsletter text','textarea'),...socials('socialLinks')] },
  { type: 'siteSettings', label: 'Site settings', singular: 'Site settings', singleton: true, adminOnly: true, fields: [field('siteName','Site name','text',true),field('siteTagline','Tagline'),field('footerDescription','Footer description','textarea'),field('defaultOgImage','Default sharing image','image'),field('contactEmail','Contact email'),field('contactPhone','Contact phone'),field('address','Address','textarea'),field('mission','Mission','textarea'),field('vision','Vision','textarea'),field('coreValues','Values (JSON array of title / description)','json'),field('cookieNotice','Cookie notice','textarea'),field('bookingSummary','Consultation summary','textarea'),...socials('socialHandles')] },
]

export function getDefinition(type: string) { return CMS_DEFINITIONS.find(item => item.type === type) }
export function getFieldValue(data: Record<string, unknown>, key: string): unknown {
  return key.split('.').reduce<unknown>((value, part) => value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>)[part] : undefined, data)
}
export function setFieldValue(data: Record<string, unknown>, key: string, value: unknown): Record<string, unknown> {
  const [first, ...rest] = key.split('.')
  if (!rest.length) return { ...data, [first]: value }
  const parent = data[first]
  return { ...data, [first]: setFieldValue(parent && typeof parent === 'object' && !Array.isArray(parent) ? parent as Record<string, unknown> : {}, rest.join('.'), value) }
}

export function paragraphBlocks(text: string) {
  return text.split(/\n\s*\n/).map(paragraph => paragraph.trim()).filter(Boolean).map((text, index) => ({ _type: 'block', _key: `paragraph-${index}`, style: 'normal', markDefs: [], children: [{ _type: 'span', _key: `span-${index}`, text, marks: [] }] }))
}
export function paragraphText(value: unknown) {
  if (!Array.isArray(value)) return ''
  return value.filter(block => block?._type === 'block').map(block => Array.isArray(block.children) ? block.children.map((child: { text?: string }) => child.text ?? '').join('') : '').join('\n\n')
}
