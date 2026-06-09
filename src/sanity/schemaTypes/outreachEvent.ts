// src/sanity/schemaTypes/outreachEvent.ts
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'outreachEvent',
  title: 'Outreach Event',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Event Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
    }),
    defineField({
      name: 'venueType',
      title: 'Venue Type',
      type: 'string',
      options: {
        list: [
          { title: 'School', value: 'school' },
          { title: 'Church', value: 'church' },
          { title: 'Community Centre', value: 'community_centre' },
          { title: 'Hospital', value: 'hospital' },
          { title: 'Other', value: 'other' },
        ],
      },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'peopleReached',
      title: 'Number of People Reached',
      type: 'number',
    }),
    defineField({
      name: 'mapUrl',
      title: 'Google Maps Embed URL',
      type: 'url',
      description: 'Paste the iframe "src" URL from Google Maps share embed.',
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured on Homepage',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})
