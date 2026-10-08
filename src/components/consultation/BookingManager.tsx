'use client'

import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'
import type { Availability, Booking } from '@/lib/booking-types'
import { localDate } from '@/lib/booking-slots'
import { Button } from '@/components/ui/Button'
import SlotPicker from './SlotPicker'
import { bookingRequest, formatFee } from './booking-client'

interface BookingManagerProps { initialBooking: Booking; token: string; availability: Pick<Availability, 'windowDays' | 'cancellationNoticeHours' | 'cancellationPolicy'>; paymentAvailable: boolean; paymentReturned: boolean }
const controlClass = 'w-full min-w-0 border border-ink/20 rounded-xl bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-darkBlue'

export default function BookingManager({ initialBooking, token, availability, paymentAvailable, paymentReturned }: BookingManagerProps) {
  const id = useId()
  const [booking, setBooking] = useState(initialBooking)
  const [now, setNow] = useState(() => Date.now())
  const [busy, setBusy] = useState(paymentReturned && initialBooking.paidNGN === 0 ? 'verify' : '')
  const [feedback, setFeedback] = useState<{ error: boolean; message: string } | null>(null)
  const [cancelConfirm, setCancelConfirm] = useState(false)
  const [rescheduling, setRescheduling] = useState(false)
  const [date, setDate] = useState(localDate(new Date(initialBooking.startAt)))
  const [startAt, setStartAt] = useState('')
  const messageRef = useRef<HTMLDivElement>(null)
  useEffect(() => { if (feedback) messageRef.current?.focus() }, [feedback])
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(timer)
  }, [])
  useEffect(() => {
    if (!paymentReturned || initialBooking.paidNGN > 0) return
    let active = true
    void bookingRequest<{ booking: Booking }>('/api/payments/verify', { token }).then(result => {
      if (active) { setBooking(result.booking); setFeedback({ error: false, message: 'Your payment status has been verified.' }) }
    }).catch((error: unknown) => {
      if (active) setFeedback({ error: true, message: error instanceof Error ? error.message : 'Payment could not be verified. Try checking again.' })
    }).finally(() => { if (active) setBusy('') })
    return () => { active = false }
  }, [paymentReturned, token, initialBooking.paidNGN])

  async function action(kind: 'cancel' | 'reschedule' | 'pay' | 'verify') {
    setBusy(kind)
    setFeedback(null)
    try {
      if (kind === 'pay') {
        const result = await bookingRequest<{ url: string }>('/api/payments/initialize', { token })
        window.location.assign(result.url)
        return
      }
      const result = await bookingRequest<{ booking: Booking }>(kind === 'verify' ? '/api/payments/verify' : '/api/booking/manage', { token, ...(kind !== 'verify' ? { action: kind, ...(kind === 'reschedule' ? { startAt } : {}) } : {}) })
      setBooking(result.booking)
      setCancelConfirm(false)
      setRescheduling(false)
      setStartAt('')
      setFeedback({ error: false, message: kind === 'cancel' ? 'Your appointment has been cancelled.' : kind === 'reschedule' ? 'Your new appointment time is confirmed.' : 'Your payment status has been verified.' })
    } catch (error) { setFeedback({ error: true, message: error instanceof Error ? error.message : 'This action could not be completed. Please try again.' }) }
    finally { setBusy('') }
  }

  const expired = booking.status === 'payment_pending' && Boolean(booking.holdExpiresAt && Date.parse(booking.holdExpiresAt) <= now)
  const editable = ['confirmed', 'payment_pending'].includes(booking.status) && Date.parse(booking.startAt) > now && !expired
  const when = new Intl.DateTimeFormat('en-NG', { timeZone: booking.timezone, dateStyle: 'full', timeStyle: 'short' }).format(new Date(booking.startAt))

  return <div className="space-y-7">
    <div className="rounded-3xl border border-brand-darkBlue/15 bg-surface-soft p-5 sm:p-8 space-y-5">
      <h2 className="text-2xl font-display font-bold text-brand-navy">{booking.serviceName}</h2>
      <dl className="grid sm:grid-cols-2 gap-5 text-ink/80">
        <div><dt className="font-bold text-brand-navy">Date and time</dt><dd>{when}<br /><span className="text-sm">{booking.timezone}</span></dd></div>
        <div><dt className="font-bold text-brand-navy">Appointment status</dt><dd className="capitalize">{expired ? 'Payment hold expired' : booking.status.replaceAll('_', ' ')}</dd></div>
        <div><dt className="font-bold text-brand-navy">Booked for</dt><dd>{booking.name}<br />{booking.email}</dd></div>
        <div><dt className="font-bold text-brand-navy">Fee and payment</dt><dd>{formatFee(booking.priceNGN)} total · {formatFee(booking.paidNGN)} paid<br /><span className="capitalize">{booking.paymentStatus.replaceAll('_', ' ')}</span></dd></div>
      </dl>
      <p><a href={`/api/booking/calendar?token=${encodeURIComponent(token)}`} download="consultation.ics" className="text-brand-darkBlue underline underline-offset-4">Download appointment for your calendar</a></p>
      {booking.paymentStatus === 'refund_requested' && <p className="rounded-xl bg-white p-4 text-ink/80">A refund review is required. The team will confirm the outcome; cancelling an appointment does not automatically return a payment.</p>}
      {booking.paymentStatus === 'refund_pending' && <p className="rounded-xl bg-white p-4 text-ink/80">Your refund is being processed by the payment provider.</p>}
      {booking.paymentStatus === 'refunded' && <p className="rounded-xl bg-white p-4 text-ink/80">The payment provider has confirmed your refund. Your bank determines when it appears in your account.</p>}
      {booking.status === 'payment_pending' && !expired && <div className="space-y-3"><p className="text-ink/80">Pay the {formatFee(booking.dueNGN)} deposit before {new Intl.DateTimeFormat('en-NG', { timeZone: booking.timezone, timeStyle: 'short' }).format(new Date(booking.holdExpiresAt!))} to secure your appointment.</p><div className="flex flex-col sm:flex-row gap-3">{paymentAvailable && <Button disabled={Boolean(busy)} onClick={() => void action('pay')}>{busy === 'pay' ? 'Preparing payment…' : `Pay ${formatFee(booking.dueNGN)}`}</Button>}<Button variant="outline" disabled={Boolean(busy)} onClick={() => void action('verify')}>{busy === 'verify' ? 'Checking payment…' : 'Check payment status'}</Button></div>{!paymentAvailable && <p className="text-ink/80">Online payment is currently unavailable. Please contact the team.</p>}</div>}
      {expired && <p className="text-ink/80">This time is no longer reserved. <Link href="/consultation" className="underline text-brand-darkBlue">Choose a new appointment</Link>. If you already paid, check your payment status or contact the team.</p>}
      {expired && <Button variant="outline" disabled={Boolean(busy)} onClick={() => void action('verify')}>Check payment status</Button>}
    </div>

    {feedback && <div ref={messageRef} tabIndex={-1} role={feedback.error ? 'alert' : 'status'} className={`rounded-xl p-4 focus:outline-none ${feedback.error ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-900'}`}>{feedback.message}</div>}

    {editable && <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3"><Button variant="outline" disabled={Boolean(busy)} onClick={() => { setRescheduling(value => !value); setCancelConfirm(false) }}>Reschedule appointment</Button><Button variant="outline" disabled={Boolean(busy)} onClick={() => { setCancelConfirm(value => !value); setRescheduling(false) }}>Cancel appointment</Button></div>
      {cancelConfirm && <div className="rounded-2xl border border-red-200 p-5 space-y-4"><p className="text-ink/80">Cancel this appointment? Your reserved time will be released.{booking.paidNGN > 0 ? ' Any payment refund requires review by the team.' : ''}</p><div className="flex flex-wrap gap-3"><Button disabled={Boolean(busy)} onClick={() => void action('cancel')}>{busy === 'cancel' ? 'Cancelling…' : 'Confirm cancellation'}</Button><Button variant="outline" disabled={Boolean(busy)} onClick={() => setCancelConfirm(false)}>Keep appointment</Button></div></div>}
      {rescheduling && <form onSubmit={event => { event.preventDefault(); void action('reschedule') }} className="rounded-2xl border border-brand-darkBlue/15 p-5 space-y-5"><h3 className="text-xl font-display font-bold text-brand-navy">Choose a new time</h3><label htmlFor={`${id}-date`} className="block font-bold text-brand-navy">New date (Nigeria time)</label><input id={`${id}-date`} type="date" value={date} min={localDate(new Date(now))} max={localDate(new Date(now + availability.windowDays * 86_400_000))} onChange={event => { setDate(event.target.value); setStartAt('') }} className={controlClass} required /><SlotPicker serviceId={booking.serviceId} date={date} timezone={booking.timezone} selected={startAt} onSelect={setStartAt} token={token} /><Button type="submit" disabled={Boolean(busy) || !startAt || startAt === booking.startAt}>{busy === 'reschedule' ? 'Changing your time…' : 'Confirm new time'}</Button></form>}
      <p className="text-sm text-ink/80">{availability.cancellationPolicy || 'Changes are available before your session begins. Paid cancellations require a refund review.'}{availability.cancellationNoticeHours > 0 ? ` At least ${availability.cancellationNoticeHours} hours’ notice is required.` : ''}</p>
    </div>}
    <div className="border-t border-ink/15 pt-6 space-y-3"><p className="text-sm text-ink/80">This page is your private booking link. Bookmark it and keep it safe.</p><Button variant="outline" onClick={() => { void navigator.clipboard.writeText(window.location.origin + `/booking/${token}`).then(() => setFeedback({ error: false, message: 'Your private booking link has been copied.' })).catch(() => setFeedback({ error: true, message: 'Copy the booking link from your browser address bar.' })) }}>Copy private booking link</Button><p><Link href="/contact?subject=Consultation#contact-form" className="text-brand-darkBlue underline underline-offset-4">Contact the team for help</Link></p></div>
  </div>
}
