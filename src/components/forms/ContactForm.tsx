'use client'

import { useEffect, useId } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { contactFormSchema, contactSubjects } from './form-schemas'
import { useSubmission } from './useSubmission'

type FormData = z.infer<typeof contactFormSchema>
const controlClass = 'w-full min-w-0 bg-white border border-ink/15 rounded-2xl px-4 sm:px-5 py-3.5 font-body focus:outline-none focus:ring-2 focus:ring-brand-darkBlue shadow-sm'

export default function ContactForm() {
  const id = useId()
  const { status, error, feedbackRef, submit, startAgain } = useSubmission('/api/contact', 'We could not send your message. Your details are still here; please try again.')
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormData>({ resolver: zodResolver(contactFormSchema) })

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('subject') === 'Consultation') setValue('subject', 'Consultation')
  }, [setValue])

  const onSubmit = async (data: FormData) => {
    if (await submit(data)) reset()
  }
  const fieldProps = (field: keyof FormData) => ({
    id: `${id}-${field}`,
    'aria-invalid': Boolean(errors[field]),
    'aria-describedby': errors[field] ? `${id}-${field}-error` : undefined,
  })
  const fieldError = (field: keyof FormData) => errors[field] ? <p id={`${id}-${field}-error`} className="text-sm text-red-800">{errors[field]?.message}</p> : null

  return (
    <div id="contact-form" className="bg-surface-soft p-5 sm:p-8 md:p-10 rounded-3xl border border-brand-darkBlue/10 shadow-sm">
      {status === 'success' ? (
        <div ref={feedbackRef} role="status" tabIndex={-1} className="text-center py-8 space-y-4 focus:outline-none">
          <h3 className="text-2xl font-display font-bold text-brand-navy">Message received</h3>
          <p className="text-ink/80 font-body">Thank you for getting in touch. Our team will reply using the email address you provided.</p>
          <Button variant="outline" onClick={startAgain}>Send another message</Button>
        </div>
      ) : (
        <form noValidate onSubmit={handleSubmit(onSubmit)} aria-busy={status === 'loading'} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label htmlFor={`${id}-name`} className="text-sm font-bold text-brand-navy">Your name</label>
              <input {...register('name')} {...fieldProps('name')} autoComplete="name" required maxLength={120} placeholder="Your name" className={controlClass} />
              {fieldError('name')}
            </div>
            <div className="space-y-2">
              <label htmlFor={`${id}-email`} className="text-sm font-bold text-brand-navy">Your email</label>
              <input {...register('email')} {...fieldProps('email')} type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" className={controlClass} />
              {fieldError('email')}
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor={`${id}-subject`} className="text-sm font-bold text-brand-navy">Subject</label>
            <select {...register('subject')} {...fieldProps('subject')} required className={controlClass} defaultValue="">
              <option value="" disabled>Select a subject</option>
              {contactSubjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}
            </select>
            {fieldError('subject')}
          </div>
          <div className="space-y-2">
            <label htmlFor={`${id}-message`} className="text-sm font-bold text-brand-navy">Your message</label>
            <textarea {...register('message')} {...fieldProps('message')} required maxLength={5000} rows={5} placeholder="How can we help you?" className={`${controlClass} resize-y`} />
            {fieldError('message')}
          </div>
          {status === 'error' && <div ref={feedbackRef} role="alert" tabIndex={-1} className="rounded-xl bg-red-50 p-4 text-sm text-red-800 focus:outline-none">{error}</div>}
          <Button type="submit" className="w-full py-3.5" disabled={status === 'loading'}>{status === 'loading' ? 'Sending…' : 'Send message'}</Button>
        </form>
      )}
    </div>
  )
}
