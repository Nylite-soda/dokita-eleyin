// src/sanity/schemaTypes/homepageSettings.ts
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'homepageSettings',
  title: 'Homepage Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'heroHeadline',
      title: 'Hero Headline',
      type: 'string',
    }),
    defineField({
      name: 'heroSubheadline',
      title: 'Hero Subheadline',
      type: 'text',
    }),
    defineField({
      name: 'heroPrimaryCTA',
      title: 'Hero Primary CTA',
      type: 'object',
      fields: [
        { name: 'label', type: 'string', title: 'Label' },
        { name: 'link', type: 'string', title: 'Link' },
      ],
    }),
    defineField({
      name: 'heroSecondaryCTA',
      title: 'Hero Secondary CTA',
      type: 'object',
      fields: [
        { name: 'label', type: 'string', title: 'Label' },
        { name: 'link', type: 'string', title: 'Link' },
      ],
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Background Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
    }),
    defineField({
      name: 'whyWeExistTitle',
      title: 'Why We Exist Title',
      type: 'string',
    }),
    defineField({
      name: 'whyWeExistBody',
      title: 'Why We Exist Body',
      type: 'text',
    }),
    defineField({
      name: 'featuredArticles',
      title: 'Featured Articles',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'article' }] }],
    }),
    defineField({
      name: 'socialProofText',
      title: 'Social Proof Text',
      type: 'string',
    }),
    defineField({
      name: 'newsletterHeadline',
      title: 'Newsletter Headline',
      type: 'string',
    }),
    defineField({
      name: 'newsletterSubcopy',
      title: 'Newsletter Sub-copy',
      type: 'text',
    }),
    defineField({
      name: 'socialFeedEmbed',
      title: 'Social Feed Embed Code',
      type: 'text',
      description: 'Paste embed code from Elfsight, Curator.io, or Instagram here. If empty, a placeholder grid will show.',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Media Links',
      type: 'object',
      fields: [
        { name: 'instagram', type: 'url', title: 'Instagram' },
        { name: 'tiktok', type: 'url', title: 'TikTok' },
        { name: 'youtube', type: 'url', title: 'YouTube' },
      ],
    }),
  ],
})
