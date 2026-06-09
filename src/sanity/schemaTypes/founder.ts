// src/sanity/schemaTypes/founder.ts
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'founder',
  title: 'Founder',
  type: 'document',
  fields: [
    defineField({
      name: 'fullName',
      title: 'Full Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'credentials',
      title: 'Credentials',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'e.g. Dental Surgeon, Public Health Professional',
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'bio',
      title: 'Full Bio',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'shortBio',
      title: 'Short Bio',
      type: 'text',
      description: 'Used on homepage and cards',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'object',
      fields: [
        { name: 'instagram', type: 'url', title: 'Instagram' },
        { name: 'tiktok', type: 'url', title: 'TikTok' },
        { name: 'linkedin', type: 'url', title: 'LinkedIn' },
        { name: 'twitter', type: 'url', title: 'Twitter/X' },
      ],
    }),
    defineField({
      name: 'featuredQuote',
      title: 'Featured Quote',
      type: 'text',
    }),
  ],
})
