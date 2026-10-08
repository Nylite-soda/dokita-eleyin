'use client'

import { useId } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { newsletterFormSchema } from './form-schemas'
import { useSubmission } from './useSubmission'
import DentalMotion from '@/components/ui/DentalMotion'

type FormData = z.infer<typeof newsletterFormSchema>
interface NewsletterFormProps { variant?: 'inline' | 'stacked'; placeholder?: string }

export default function NewsletterForm({ variant = 'inline', placeholder = 'Enter your email address' }: NewsletterFormProps) {
  const id = useId()
  const { status, error, feedbackRef, submit } = useSubmission('/api/newsletter', 'We could not subscribe you. Your email is still here; please try again.')
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({ resolver: zodResolver(newsletterFormSchema) })
  const onSubmit = async (data: FormData) => {
    if (await submit(data)) reset()
  }

  return (
    <div className="w-full max-w-md">
      {status === 'success' ? (
        <div ref={feedbackRef} role="status" tabIndex={-1} className="bg-white text-brand-navy p-4 rounded-2xl font-body text-center focus:outline-none">Thank you for subscribing. You are on the list for future dental tips.</div>
      ) : (
        <form noValidate onSubmit={handleSubmit(onSubmit)} aria-busy={status === 'loading'} className="space-y-3">
          <div className={cn('flex flex-col gap-3', variant === 'inline' && 'sm:flex-row')}>
            <div className="grow min-w-0">
              <label htmlFor={`${id}-email`} className="sr-only">Email address for dental tips</label>
              <input {...register('email')} id={`${id}-email`} type="email" autoComplete="email" required maxLength={254} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? `${id}-email-error` : undefined} placeholder={placeholder} className="w-full min-w-0 bg-white text-ink px-4 sm:px-5 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-navy placeholder:text-ink/60" />
              {errors.email && <p id={`${id}-email-error`} className="mt-2 rounded-lg bg-white px-3 py-2 text-sm text-red-800 font-body">{errors.email.message}</p>}
            </div>
            <button type="submit" disabled={status === 'loading'} className="shrink-0 bg-brand-navy text-white font-bold px-6 py-3 rounded-full hover:bg-white hover:text-brand-navy focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white transition-colors disabled:opacity-60">{status === 'loading' && <DentalMotion variant="paste" size="sm" decorative className="mr-2 text-brand-cyan" />}{status === 'loading' ? 'Joining…' : 'Subscribe'}</button>
          </div>
          {status === 'error' && <div ref={feedbackRef} role="alert" tabIndex={-1} className="rounded-xl bg-white p-3 text-sm text-red-800 focus:outline-none">{error}</div>}
        </form>
      )}
    </div>
  )
}
