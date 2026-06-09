// src/sanity/schemaTypes/impactStat.ts
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'impactStat',
  title: 'Impact Stat',
  type: 'document',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'e.g. Individuals Reached',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'value',
      title: 'Value',
      type: 'number',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icon Name',
      type: 'string',
      description: 'Maps to a Tabler icon (e.g. ti-book)',
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
    }),
  ],
})
