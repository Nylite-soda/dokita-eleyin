// src/sanity/schemaTypes/siteSettings.ts
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
    }),
    defineField({
      name: 'siteTagline',
      title: 'Site Tagline',
      type: 'string',
    }),
    defineField({
      name: 'defaultOgImage',
      title: 'Default OG Image',
      type: 'image',
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
    }),
    defineField({
      name: 'contactPhone',
      title: 'Contact Phone',
      type: 'string',
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'text',
    }),
    defineField({
      name: 'socialHandles',
      title: 'Social Handles',
      type: 'object',
      fields: [
        { name: 'instagram', type: 'string', title: 'Instagram' },
        { name: 'tiktok', type: 'string', title: 'TikTok' },
        { name: 'youtube', type: 'string', title: 'YouTube' },
        { name: 'linkedin', type: 'string', title: 'LinkedIn' },
      ],
    }),
    defineField({
      name: 'footerDescription',
      title: 'Footer Description Text',
      type: 'text',
    }),
    defineField({
      name: 'mission',
      title: 'Our Mission',
      type: 'text',
    }),
    defineField({
      name: 'vision',
      title: 'Our Vision',
      type: 'text',
    }),
    defineField({
      name: 'coreValues',
      title: 'Core Values',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', type: 'string', title: 'Value Title' },
            { name: 'description', type: 'text', title: 'Description' },
          ],
        },
      ],
    }),
    defineField({
      name: 'cookieNotice',
      title: 'Cookie Notice Text',
      type: 'text',
    }),
  ],
})
