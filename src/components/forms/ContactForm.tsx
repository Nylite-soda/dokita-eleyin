// src/components/forms/ContactForm.tsx
'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  name: z.string().min(2, 'Name is too short'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Please select a subject'),
  message: z.string().min(10, 'Message is too short'),
})

type FormData = z.infer<typeof schema>

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (data: FormData) => {
    setStatus('loading')
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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

  return (
    <div className="bg-surface-soft p-8 md:p-12 rounded-[2.5rem] border border-brand-lightBlue/10 shadow-sm">
      {status === 'success' ? (
        <div className="text-center py-12 space-y-4">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl">✓</div>
          <h3 className="text-2xl font-display font-bold text-brand-navy">Message Sent!</h3>
          <p className="text-ink/60 font-body">We've received your message and will get back to you soon.</p>
          <Button variant="outline" onClick={() => setStatus('idle')}>Send another message</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold font-display text-brand-navy ml-1">Your Name</label>
              <input 
                {...register('name')}
                placeholder="Name" 
                className="w-full bg-white border-none rounded-2xl px-6 py-4 font-body focus:ring-2 focus:ring-brand-lightBlue shadow-sm"
              />
              {errors.name && <p className="text-xs text-red-500 ml-1">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold font-display text-brand-navy ml-1">Your Email</label>
              <input 
                {...register('email')}
                placeholder="Email" 
                className="w-full bg-white border-none rounded-2xl px-6 py-4 font-body focus:ring-2 focus:ring-brand-lightBlue shadow-sm"
              />
              {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email.message}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold font-display text-brand-navy ml-1">Subject</label>
            <select 
              {...register('subject')}
              className="w-full bg-white border-none rounded-2xl px-6 py-4 font-body focus:ring-2 focus:ring-brand-lightBlue shadow-sm appearance-none"
            >
              <option value="">Select a subject</option>
              <option value="General Enquiry">General Enquiry</option>
              <option value="Media Enquiry">Media Enquiry</option>
              <option value="Partnership">Partnership</option>
              <option value="Speaking Engagement">Speaking Engagement</option>
              <option value="Other">Other</option>
            </select>
            {errors.subject && <p className="text-xs text-red-500 ml-1">{errors.subject.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold font-display text-brand-navy ml-1">Your Message</label>
            <textarea 
              {...register('message')}
              rows={5} 
              placeholder="How can we help you?"
              className="w-full bg-white border-none rounded-2xl px-6 py-4 font-body focus:ring-2 focus:ring-brand-lightBlue shadow-sm resize-none"
            />
            {errors.message && <p className="text-xs text-red-500 ml-1">{errors.message.message}</p>}
          </div>

          <Button 
            type="submit" 
            className="w-full py-4 rounded-2xl"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Sending...' : 'Send Message'}
          </Button>
          
          {status === 'error' && (
            <p className="text-center text-sm text-red-500 font-body">Something went wrong. Please try again.</p>
          )}
        </form>
      )}
    </div>
  )
}
