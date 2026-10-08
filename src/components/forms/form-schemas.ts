import { z } from 'zod'

const name = z.string().trim().min(2, 'Please enter at least two characters.').max(120, 'Please use no more than 120 characters.')
const email = z.string().trim().max(254).email('Please enter a valid email address.').toLowerCase()
const message = z.string().trim().min(10, 'Please tell us a little more (at least 10 characters).').max(5000, 'Please keep your message under 5,000 characters.')

export const contactSubjects = ['General Enquiry', 'Consultation', 'Media Enquiry', 'Partnership', 'Speaking Engagement', 'Other'] as const
export const partnershipInterests = ['School Programs', 'Community Outreach', 'Health Campaigns', 'Content Collaboration', 'Corporate Sponsorship', 'Other'] as const
export const organizationTypes = ['school', 'ngo', 'corporate', 'healthcare', 'government', 'other'] as const

export const contactFormSchema = z.object({
  name,
  email,
  subject: z.enum(contactSubjects, { error: 'Please select a subject.' }),
  message,
})

export const partnershipFormSchema = z.object({
  organizationName: name,
  contactPerson: name,
  email,
  phone: z.string().trim().min(7, 'Please enter a valid phone number.').max(30).regex(/^\+?[\d\s().-]+$/, 'Use numbers, spaces, or a country code.'),
  orgType: z.enum(organizationTypes, { error: 'Please select an organization type.' }),
  interest: z.array(z.enum(partnershipInterests)).min(1, 'Select at least one area of interest.').max(partnershipInterests.length),
  message,
})

export const newsletterFormSchema = z.object({ email })
