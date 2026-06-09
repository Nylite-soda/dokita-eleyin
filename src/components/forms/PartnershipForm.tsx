// src/components/forms/PartnershipForm.tsx
'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  organizationName: z.string().min(2, 'Organization name is too short'),
  contactPerson: z.string().min(2, 'Name is too short'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is too short'),
  orgType: z.string().min(1, 'Please select an organization type'),
  interest: z.array(z.string()).min(1, 'Select at least one area of interest'),
  message: z.string().min(10, 'Message is too short'),
})

type FormData = z.infer<typeof schema>

export default function PartnershipForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { interest: [] }
  })

  const onSubmit = async (data: FormData) => {
    setStatus('loading')
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          subject: `Partnership Inquiry: ${data.organizationName}`,
          message: `Org Type: ${data.orgType}\nInterests: ${data.interest.join(', ')}\n\n${data.message}`
        }),
      })
      if (response.ok) {
        setStatus('success')
        reset()
      } else {
        setStatus('error')
      }
    } catch (err) {
      setStatus('error')
    }
  }

  const interests = [
    'School Programs', 'Community Outreach', 'Health Campaigns', 
    'Content Collaboration', 'Corporate Sponsorship', 'Other'
  ]

  return (
    <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-surface-card shadow-xl shadow-brand-darkBlue/5">
      {status === 'success' ? (
        <div className="text-center py-12">
          <h3 className="text-2xl font-display font-bold text-brand-navy">Application Received!</h3>
          <p className="text-ink/60 font-body mt-4">We'll review your partnership request and reach out shortly.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold font-display text-brand-navy">Organization Name</label>
              <input {...register('organizationName')} className="w-full bg-surface-soft border-none rounded-2xl px-8 py-4" />
              {errors.organizationName && <p className="text-xs text-red-500">{errors.organizationName.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold font-display text-brand-navy">Contact Person</label>
              <input {...register('contactPerson')} className="w-full bg-surface-soft border-none rounded-2xl px-8 py-4" />
              {errors.contactPerson && <p className="text-xs text-red-500">{errors.contactPerson.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold font-display text-brand-navy">Work Email</label>
              <input {...register('email')} className="w-full bg-surface-soft border-none rounded-2xl px-8 py-4" />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold font-display text-brand-navy">Phone Number</label>
              <input {...register('phone')} className="w-full bg-surface-soft border-none rounded-2xl px-8 py-4" />
              {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold font-display text-brand-navy">Areas of Interest</label>
            <div className="grid grid-cols-2 gap-4">
              {interests.map((item) => (
                <label key={item} className="flex items-center gap-3 font-body text-sm cursor-pointer group">
                  <input 
                    type="checkbox" 
                    value={item} 
                    {...register('interest')} 
                    className="w-5 h-5 rounded border-brand-lightBlue text-brand-darkBlue focus:ring-brand-lightBlue"
                  />
                  <span className="group-hover:text-brand-darkBlue transition-colors">{item}</span>
                </label>
              ))}
            </div>
            {errors.interest && <p className="text-xs text-red-500">{errors.interest.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold font-display text-brand-navy">Tell us more</label>
            <textarea {...register('message')} rows={4} className="w-full bg-surface-soft border-none rounded-2xl px-8 py-4 resize-none" />
          </div>

          <Button type="submit" className="w-full" disabled={status === 'loading'}>
            {status === 'loading' ? 'Submitting...' : 'Submit Partnership Request'}
          </Button>
        </form>
      )}
    </div>
  )
}
