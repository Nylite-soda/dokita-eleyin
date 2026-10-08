'use client'

import { useId } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { partnershipFormSchema, partnershipInterests } from './form-schemas'
import { useSubmission } from './useSubmission'

type FormData = z.infer<typeof partnershipFormSchema>
const controlClass = 'w-full min-w-0 bg-surface-soft border border-ink/15 rounded-2xl px-4 sm:px-5 py-3.5 font-body focus:outline-none focus:ring-2 focus:ring-brand-darkBlue'
const textFields = [
  { field: 'organizationName', label: 'Organization name', autoComplete: 'organization', type: 'text' },
  { field: 'contactPerson', label: 'Contact person', autoComplete: 'name', type: 'text' },
  { field: 'email', label: 'Work email', autoComplete: 'email', type: 'email' },
  { field: 'phone', label: 'Phone number', autoComplete: 'tel', type: 'tel' },
] as const

export default function PartnershipForm() {
  const id = useId()
  const { status, error, feedbackRef, submit, startAgain } = useSubmission('/api/contact', 'We could not send your request. Your details are still here; please try again.')
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({ resolver: zodResolver(partnershipFormSchema), defaultValues: { interest: [] } })
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
    <div className="bg-white p-5 sm:p-8 md:p-10 rounded-3xl border border-surface-card shadow-xl shadow-brand-darkBlue/5">
      {status === 'success' ? (
        <div ref={feedbackRef} role="status" tabIndex={-1} className="text-center py-8 space-y-4 focus:outline-none">
          <h3 className="text-2xl font-display font-bold text-brand-navy">Partnership request received</h3>
          <p className="text-ink/80 font-body">Thank you. Our team will review your request and reply using the email address you provided.</p>
          <Button variant="outline" onClick={startAgain}>Send another request</Button>
        </div>
      ) : (
        <form noValidate onSubmit={handleSubmit(onSubmit)} aria-busy={status === 'loading'} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {textFields.map(({ field, label, autoComplete, type }) => (
              <div key={field} className="space-y-2">
                <label htmlFor={`${id}-${field}`} className="text-sm font-bold text-brand-navy">{label}</label>
                <input {...register(field)} {...fieldProps(field)} type={type} autoComplete={autoComplete} required maxLength={field === 'email' ? 254 : field === 'phone' ? 30 : 120} className={controlClass} />
                {fieldError(field)}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <label htmlFor={`${id}-orgType`} className="text-sm font-bold text-brand-navy">Organization type</label>
            <select {...register('orgType')} {...fieldProps('orgType')} required defaultValue="" className={controlClass}>
              <option value="" disabled>Select organization type</option>
              <option value="school">School</option>
              <option value="ngo">NGO</option>
              <option value="corporate">Corporate organization</option>
              <option value="healthcare">Healthcare institution</option>
              <option value="government">Government</option>
              <option value="other">Other</option>
            </select>
            {fieldError('orgType')}
          </div>
          <fieldset className="space-y-3" aria-describedby={errors.interest ? `${id}-interest-error` : undefined}>
            <legend className="text-sm font-bold text-brand-navy mb-3">Areas of interest (select at least one)</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {partnershipInterests.map((item, index) => (
                <label key={item} htmlFor={`${id}-interest-${index}`} className="flex items-start gap-3 font-body text-sm text-ink/80 cursor-pointer min-h-8">
                  <input id={`${id}-interest-${index}`} type="checkbox" value={item} {...register('interest')} aria-invalid={Boolean(errors.interest)} aria-describedby={errors.interest ? `${id}-interest-error` : undefined} className="w-5 h-5 shrink-0 rounded accent-brand-darkBlue focus:ring-brand-darkBlue" />
                  <span>{item}</span>
                </label>
              ))}
            </div>
            {fieldError('interest')}
          </fieldset>
          <div className="space-y-2">
            <label htmlFor={`${id}-message`} className="text-sm font-bold text-brand-navy">Tell us more</label>
            <textarea {...register('message')} {...fieldProps('message')} required maxLength={5000} rows={4} className={`${controlClass} resize-y`} />
            {fieldError('message')}
          </div>
          {status === 'error' && <div ref={feedbackRef} role="alert" tabIndex={-1} className="rounded-xl bg-red-50 p-4 text-sm text-red-800 focus:outline-none">{error}</div>}
          <Button type="submit" className="w-full px-4 py-3.5" disabled={status === 'loading'}>{status === 'loading' ? 'Submitting…' : 'Submit partnership request'}</Button>
        </form>
      )}
    </div>
  )
}
