'use client'
import { FormEvent, useState } from 'react'
import type { Availability } from '@/lib/booking-types'
import { bookingAdminError, bookingAdminRequest, bookingDate, localToBookingISO } from './booking-api'

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function AvailabilityManager({ initialAvailability }: { initialAvailability: Availability }) {
  const [draft, setDraft] = useState(initialAvailability)
  const [blackout, setBlackout] = useState({ start: '', end: '', reason: '' })
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  function addBlackout() {
    setError(''); setStatus('')
    if (!blackout.start || !blackout.end) { setError('Enter the start and end of the unavailable period.'); return }
    try {
      const startAt = localToBookingISO(blackout.start), endAt = localToBookingISO(blackout.end)
      if (Date.parse(endAt) <= Date.parse(startAt)) { setError('The unavailable period must end after it begins.'); return }
      setDraft({ ...draft, blackouts: [...draft.blackouts, { id: crypto.randomUUID(), startAt, endAt, reason: blackout.reason.trim() }] })
      setBlackout({ start: '', end: '', reason: '' })
      setStatus('Unavailable period added to the form. Save availability to apply it.')
    } catch { setError('Enter valid dates for the unavailable period.') }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setStatus('')
    if (draft.hours.some(hour => hour.start >= hour.end)) { setError('Each working period must end after it starts.'); return }
    if (draft.hours.some((hour, index) => draft.hours.some((other, otherIndex) => index !== otherIndex && hour.weekday === other.weekday && hour.start < other.end && hour.end > other.start))) { setError('Working periods on the same day cannot overlap.'); return }
    setBusy(true)
    try {
      await bookingAdminRequest('/api/booking/admin/availability', 'PUT', draft)
      const result = await bookingAdminRequest<{ availability: Availability }>('/api/booking/admin/availability')
      setDraft(result.availability); setStatus('Availability saved. Existing bookings remain unchanged.')
    } catch (cause) { setError(bookingAdminError(cause)) } finally { setBusy(false) }
  }

  return <section className="admin-panel">
    <form onSubmit={submit} className="space-y-8"><fieldset disabled={busy} className="space-y-8">
      <div className="admin-notice">All working hours and unavailable dates use Africa/Lagos (UTC+1). Availability changes apply to new bookings.</div>
      <div className="admin-grid">
        <label className="admin-field">Minimum booking notice (hours)<input type="number" min={0} max={336} required value={draft.minNoticeHours} onChange={event => setDraft({ ...draft, minNoticeHours: Number(event.target.value) })} /></label>
        <label className="admin-field">Booking window (days ahead)<input type="number" min={1} max={365} required value={draft.windowDays} onChange={event => setDraft({ ...draft, windowDays: Number(event.target.value) })} /></label>
        <label className="admin-field">Cancellation / rescheduling notice (hours)<input type="number" min={0} max={336} required value={draft.cancellationNoticeHours} onChange={event => setDraft({ ...draft, cancellationNoticeHours: Number(event.target.value) })} /></label>
      </div>
      <label className="admin-field">Cancellation and refund policy (shown to clients)<textarea rows={4} maxLength={2000} value={draft.cancellationPolicy} onChange={event => setDraft({ ...draft, cancellationPolicy: event.target.value })} placeholder="Explain cancellation notice and when refunds apply." /></label>
      <section><h2 className="text-xl font-semibold mb-2">Weekly working hours</h2><p className="text-ink-muted mb-4">Add one or more working periods for each available day. Days without a period stay closed.</p>
        <div className="space-y-4">{draft.hours.map((hour, index) => <div key={index} className="grid sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
          <label className="admin-field">Day<select value={hour.weekday} onChange={event => setDraft({ ...draft, hours: draft.hours.map((item, itemIndex) => itemIndex === index ? { ...item, weekday: Number(event.target.value) as Availability['hours'][number]['weekday'] } : item) })}>{weekdays.map((day, dayIndex) => <option key={day} value={dayIndex}>{day}</option>)}</select></label>
          <label className="admin-field">Starts<input type="time" required step={300} value={hour.start} onChange={event => setDraft({ ...draft, hours: draft.hours.map((item, itemIndex) => itemIndex === index ? { ...item, start: event.target.value } : item) })} /></label>
          <label className="admin-field">Ends<input type="time" required step={300} value={hour.end} onChange={event => setDraft({ ...draft, hours: draft.hours.map((item, itemIndex) => itemIndex === index ? { ...item, end: event.target.value } : item) })} /></label>
          <button type="button" className="admin-button-secondary" aria-label={`Remove ${weekdays[hour.weekday]} ${hour.start} working period`} onClick={() => setDraft({ ...draft, hours: draft.hours.filter((_, itemIndex) => itemIndex !== index) })}>Remove</button>
        </div>)}</div>
        {!draft.hours.length && <p className="admin-notice">No working hours configured. No appointments will be available.</p>}
        <button type="button" className="admin-button-secondary mt-4" onClick={() => setDraft({ ...draft, hours: [...draft.hours, { weekday: 1, start: '09:00', end: '17:00' }] })}>Add working period</button>
      </section>
      <section><h2 className="text-xl font-semibold mb-4">Unavailable dates</h2>
        <div className="admin-grid"><label className="admin-field">From (Lagos time)<input type="datetime-local" value={blackout.start} onChange={event => setBlackout({ ...blackout, start: event.target.value })} /></label><label className="admin-field">Until (Lagos time)<input type="datetime-local" value={blackout.end} onChange={event => setBlackout({ ...blackout, end: event.target.value })} /></label><label className="admin-field">Reason (internal)<input maxLength={300} value={blackout.reason} onChange={event => setBlackout({ ...blackout, reason: event.target.value })} /></label></div>
        <button type="button" className="admin-button-secondary mt-4" onClick={addBlackout}>Add unavailable period</button>
        {!!draft.blackouts.length && <ul className="space-y-3 mt-5">{draft.blackouts.map(period => <li key={period.id} className="flex flex-wrap gap-3 items-center justify-between bg-surface-soft p-4 rounded-xl"><div>{bookingDate(period.startAt)} – {bookingDate(period.endAt)}{period.reason && <p className="text-sm text-ink-muted">{period.reason}</p>}</div><button type="button" className="admin-button-secondary" onClick={() => setDraft({ ...draft, blackouts: draft.blackouts.filter(item => item.id !== period.id) })} aria-label={`Remove unavailable period starting ${bookingDate(period.startAt)}`}>Remove</button></li>)}</ul>}
      </section>
      <button type="submit" className="admin-button">{busy ? 'Saving…' : 'Save availability'}</button>
    </fieldset></form>
    {error && <p role="alert" className="admin-error mt-4">{error}</p>}<p role="status" className="text-brand-darkBlue mt-4">{status}</p>
  </section>
}
