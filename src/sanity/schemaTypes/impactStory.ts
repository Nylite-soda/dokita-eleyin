// src/sanity/schemaTypes/impactStory.ts
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'impactStory',
  title: 'Impact Story',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Person Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      description: 'e.g. Parent, Teacher, Student',
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'story',
      title: 'Story',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})
