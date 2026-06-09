// src/sanity/schemaTypes/partner.ts
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'partner',
  title: 'Partner',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Organization Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'website',
      title: 'Website URL',
      type: 'url',
    }),
    defineField({
      name: 'type',
      title: 'Partnership Type',
      type: 'string',
      options: {
        list: [
          { title: 'School', value: 'school' },
          { title: 'NGO', value: 'ngo' },
          { title: 'Corporate', value: 'corporate' },
          { title: 'Healthcare', value: 'healthcare' },
          { title: 'Government', value: 'government' },
        ],
      },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    }),
  ],
})
