'use client'

import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Availability, Booking, BookingService } from '@/lib/booking-types'
import { localDate } from '@/lib/booking-slots'
import { Button } from '@/components/ui/Button'
import SlotPicker from './SlotPicker'
import { bookingRequest, formatFee } from './booking-client'
import DentalMotion from '@/components/ui/DentalMotion'

interface BookingWidgetProps { services: BookingService[]; availability: Pick<Availability, 'timezone' | 'minNoticeHours' | 'windowDays' | 'cancellationNoticeHours' | 'cancellationPolicy'> }
const schema = z.object({ name: z.string().trim().min(2, 'Enter your full name.').max(120), email: z.email('Enter a valid email address.').max(254).toLowerCase(), phone: z.string().trim().max(30), notes: z.string().trim().max(2000), consent: z.boolean().refine(value => value, 'Please agree to the booking terms.') })
type GuestData = z.infer<typeof schema>
const controlClass = 'w-full min-w-0 border border-ink/20 rounded-xl bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-darkBlue'

export default function BookingWidget({ services, availability }: BookingWidgetProps) {
  const id = useId()
  const [serviceId, setServiceId] = useState(services[0]?.id || '')
  const [now] = useState(() => Date.now())
  const [date, setDate] = useState(() => localDate(new Date()))
  const [timezone, setTimezone] = useState<string>('Africa/Lagos')
  const [startAt, setStartAt] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ booking: Booking; token: string; duplicate: boolean; emailConfigured: boolean } | null>(null)
  const feedback = useRef<HTMLDivElement>(null)
  const request = useRef<{ payload: string; idempotencyKey: string } | null>(null)
  const { register, handleSubmit, formState: { errors } } = useForm<GuestData>({ resolver: zodResolver(schema), defaultValues: { phone: '', notes: '', consent: false } })
  const service = services.find(item => item.id === serviceId)
  useEffect(() => { if (error || result) feedback.current?.focus() }, [error, result])
  const onSubmit = async (data: GuestData) => {
    if (!startAt) { setError('Choose an available appointment time.'); return }
    setError('')
    setBusy(true)
    const payload = { ...data, serviceId, startAt, timezone }
    const serialized = JSON.stringify(payload)
    if (request.current?.payload !== serialized) request.current = { payload: serialized, idempotencyKey: crypto.randomUUID() }
    try { setResult(await bookingRequest('/api/booking', { ...payload, idempotencyKey: request.current.idempotencyKey })) }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Your appointment could not be booked. Please try again.') }
    finally { setBusy(false) }
  }

  if (services.length === 0) return <div className="rounded-3xl bg-surface-soft border border-brand-darkBlue/10 p-6 sm:p-10 text-center space-y-5">
    <h3 className="text-2xl font-display font-bold text-brand-navy">Request a consultation</h3>
    <p className="max-w-xl mx-auto text-ink/80 leading-relaxed">Online appointments are not open yet. Send a consultation enquiry and the team can confirm availability, fees, and session details with you.</p>
    <Button asChild><Link href="/contact?subject=Consultation#contact-form">Contact us to book</Link></Button>
  </div>

  if (result) return <div ref={feedback} tabIndex={-1} role="status" className="rounded-3xl bg-surface-soft p-6 sm:p-10 space-y-5 focus:outline-none">
    <h3 className="text-2xl font-display font-bold text-brand-navy">{result.booking.status === 'payment_pending' ? 'Your time is held for 15 minutes' : 'Your consultation is confirmed'}</h3>
    <p className="text-ink/80">{result.booking.serviceName} · {new Intl.DateTimeFormat('en-NG', { dateStyle: 'full', timeStyle: 'short', timeZone: result.booking.timezone }).format(new Date(result.booking.startAt))} ({result.booking.timezone})</p>
    {result.booking.status === 'payment_pending' && <p className="text-ink/80">Complete your {formatFee(result.booking.dueNGN)} deposit using the private booking page to secure this appointment.</p>}
    {result.token ? <><Button asChild><Link href={`/booking/${result.token}`}>{result.booking.status === 'payment_pending' ? 'Pay and manage your booking' : 'View and manage your booking'}</Link></Button><p className="text-sm text-ink/80">Save your private booking link. You will need it to cancel or reschedule.</p></> : <p className="text-ink/80">This request was already received. Use the private link in your booking email, or contact the team if you need help.</p>}
    <p className="text-sm text-ink/80">{result.emailConfigured ? 'A booking email has been queued. If it does not arrive, keep your private link and contact the team.' : 'Email confirmations are currently unavailable. Please keep your private booking link.'}</p>
  </div>

  const fieldError = (field: keyof GuestData) => errors[field] ? <p id={`${id}-${field}-error`} className="text-sm text-red-800">{errors[field]?.message}</p> : null
  return <form noValidate onSubmit={event => { void handleSubmit(onSubmit)(event) }} aria-busy={busy} className="rounded-3xl border border-brand-darkBlue/15 bg-surface-soft p-5 sm:p-8 space-y-6">
    <div className="grid md:grid-cols-2 gap-5">
      <div className="space-y-2"><label htmlFor={`${id}-service`} className="font-bold text-brand-navy">Consultation</label><select id={`${id}-service`} value={serviceId} onChange={event => { setServiceId(event.target.value); setStartAt('') }} className={controlClass}>{services.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
      <div className="space-y-2"><label htmlFor={`${id}-date`} className="font-bold text-brand-navy">Date (Nigeria time)</label><input id={`${id}-date`} type="date" value={date} min={localDate(new Date(now))} max={localDate(new Date(now + availability.windowDays * 86_400_000))} onChange={event => { setDate(event.target.value); setStartAt('') }} className={controlClass} required /></div>
    </div>
    {service && <div className="rounded-xl bg-white p-4 space-y-2 text-ink/80"><p className="font-bold text-brand-navy">{service.durationMinutes} minutes · {formatFee(service.priceNGN || 0)}{service.depositNGN ? ` · ${formatFee(service.depositNGN)} deposit to book` : ' · no online payment required'}</p>{service.description && <p>{service.description}</p>}{service.depositNGN && service.priceNGN !== null && service.depositNGN < service.priceNGN ? <p className="text-sm">Remaining fee: {formatFee(service.priceNGN - service.depositNGN)}. The team will confirm how to pay the balance.</p> : null}</div>}
    <div className="space-y-2"><label htmlFor={`${id}-timezone`} className="font-bold text-brand-navy">Show times in your timezone</label><select id={`${id}-timezone`} value={timezone} onChange={event => setTimezone(event.target.value)} className={controlClass}>{['Africa/Lagos', 'Africa/Accra', 'Europe/London', 'Europe/Paris', 'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Asia/Dubai', 'Asia/Kolkata', 'Australia/Sydney'].map(zone => <option key={zone}>{zone}</option>)}</select><p className="text-sm text-ink/80">The date above follows Nigeria time; appointment times below use your selected timezone.</p></div>
    <SlotPicker serviceId={serviceId} date={date} timezone={timezone} selected={startAt} onSelect={setStartAt} />
    <div className="grid md:grid-cols-2 gap-5">{([{ field: 'name', label: 'Full name', type: 'text', autoComplete: 'name' }, { field: 'email', label: 'Email address', type: 'email', autoComplete: 'email' }, { field: 'phone', label: 'Phone number (optional)', type: 'tel', autoComplete: 'tel' }] as const).map(({ field, label, type, autoComplete }) => <div key={field} className="space-y-2"><label htmlFor={`${id}-${field}`} className="font-bold text-brand-navy">{label}</label><input {...register(field)} id={`${id}-${field}`} type={type} autoComplete={autoComplete} aria-invalid={Boolean(errors[field])} aria-describedby={errors[field] ? `${id}-${field}-error` : undefined} className={controlClass} required={field !== 'phone'} maxLength={field === 'email' ? 254 : field === 'phone' ? 30 : 120} />{fieldError(field)}</div>)}</div>
    <div className="space-y-2"><label htmlFor={`${id}-notes`} className="font-bold text-brand-navy">What would you like to discuss? (optional)</label><textarea {...register('notes')} id={`${id}-notes`} rows={3} maxLength={2000} aria-invalid={Boolean(errors.notes)} aria-describedby={`${id}-notes-help${errors.notes ? ` ${id}-notes-error` : ''}`} className={controlClass} /><p id={`${id}-notes-help`} className="text-sm text-ink/80">A brief topic is enough. Please avoid sharing sensitive medical information here.</p>{fieldError('notes')}</div>
    <div className="text-sm text-ink/80 space-y-2"><p>{availability.cancellationPolicy || 'Use your private booking link to cancel or reschedule before your session starts. Paid cancellations require a refund review by the team.'}</p>{availability.cancellationNoticeHours > 0 && <p>Changes require at least {availability.cancellationNoticeHours} hours’ notice.</p>}<label htmlFor={`${id}-consent`} className="flex items-start gap-3"><input {...register('consent')} id={`${id}-consent`} type="checkbox" aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? `${id}-consent-error` : undefined} className="w-5 h-5 shrink-0 accent-brand-darkBlue" /><span>I agree to the booking and cancellation terms, and to being contacted about this appointment.</span></label>{fieldError('consent')}</div>
    {error && <div ref={feedback} tabIndex={-1} role="alert" className="rounded-xl bg-red-50 p-4 text-red-800 focus:outline-none">{error}</div>}
    <Button type="submit" disabled={busy} className="w-full">{busy && <DentalMotion size="sm" variant="brush" decorative className="mr-2 text-white" />}{busy ? 'Reserving your appointment…' : service?.depositNGN ? 'Reserve time and continue to payment' : 'Confirm consultation'}</Button>
  </form>
}
