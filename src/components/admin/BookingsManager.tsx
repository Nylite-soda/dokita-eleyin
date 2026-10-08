'use client'
import { FormEvent, useMemo, useState } from 'react'
import type { Booking, BookingService } from '@/lib/booking-types'
import { bookingAdminError, bookingAdminRequest, bookingDate, bookingISOToLocal, bookingMoney, localToBookingISO } from './booking-api'
import BookingNotifications from './BookingNotifications'

type Action = 'cancel' | 'complete' | 'no_show' | 'confirm' | 'reschedule' | 'refund'
const statuses = ['confirmed', 'payment_pending', 'cancelled', 'completed', 'no_show'] as const
const readable = (value: string) => value.replaceAll('_', ' ')

export default function BookingsManager({ initialBookings, services, paymentConfigured }: { initialBookings: Booking[]; services: BookingService[]; paymentConfigured: boolean }) {
  const [bookings, setBookings] = useState(initialBookings)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<Action | null>(null)
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [manual, setManual] = useState({ serviceId: '', startAt: '', name: '', email: '', phone: '', notes: '' })
  const [showManual, setShowManual] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const selected = bookings.find(booking => booking.id === selectedId)
  const filtered = useMemo(() => bookings.filter(booking => (filter === 'all' || booking.status === filter) && `${booking.name} ${booking.email} ${booking.serviceName}`.toLowerCase().includes(search.trim().toLowerCase())), [bookings, filter, search])

  async function reload() {
    const result = await bookingAdminRequest<{ bookings: Booking[] }>('/api/booking/admin/bookings')
    setBookings(result.bookings)
  }
  function select(booking: Booking) { setSelectedId(booking.id); setPendingAction(null); setRescheduleTime(bookingISOToLocal(booking.startAt)); setError(''); setStatus('') }
  async function act() {
    if (!selected || !pendingAction) return
    setBusy(true); setError(''); setStatus('')
    try {
      if (pendingAction === 'refund') await bookingAdminRequest('/api/payments/refund', 'POST', { bookingId: selected.id })
      else await bookingAdminRequest('/api/booking/admin/bookings', 'PATCH', { id: selected.id, action: pendingAction, ...(pendingAction === 'reschedule' ? { startAt: localToBookingISO(rescheduleTime) } : {}) })
      await reload(); setStatus(pendingAction === 'refund' ? 'Refund submitted to the payment provider. Its status will update after provider confirmation.' : 'Booking updated.'); setPendingAction(null)
    } catch (cause) { setError(bookingAdminError(cause)) } finally { setBusy(false) }
  }
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setStatus('')
    try {
      await bookingAdminRequest('/api/booking/admin/bookings', 'POST', { ...manual, startAt: localToBookingISO(manual.startAt), timezone: 'Africa/Lagos' })
      await reload(); setManual({ serviceId: '', startAt: '', name: '', email: '', phone: '', notes: '' }); setShowManual(false); setStatus('Manual booking created.')
    } catch (cause) { setError(bookingAdminError(cause)) } finally { setBusy(false) }
  }

  return <div className="space-y-6">
    <div className="flex flex-wrap gap-4 items-end"><label className="admin-field">Status<select value={filter} onChange={event => setFilter(event.target.value)}><option value="all">All bookings</option>{statuses.map(value => <option key={value} value={value}>{readable(value)}</option>)}</select></label><label className="admin-field grow">Find a booking<input type="search" placeholder="Name, email, or service" value={search} onChange={event => setSearch(event.target.value)} /></label><button type="button" className="admin-button-secondary" disabled={busy} onClick={async () => { setBusy(true); setError(''); try { await reload(); setStatus('Booking list refreshed.') } catch (cause) { setError(bookingAdminError(cause)) } finally { setBusy(false) } }}>Refresh</button><button type="button" className="admin-button" disabled={busy} onClick={() => setShowManual(!showManual)} aria-expanded={showManual} aria-controls="manual-booking">{showManual ? 'Close manual form' : 'Add manual booking'}</button></div>
    {error && <p role="alert" className="admin-error">{error}</p>}<p role="status" className="text-brand-darkBlue">{status}</p>
    {showManual && <section id="manual-booking" className="admin-panel"><h2 className="text-xl font-semibold mb-4">Manual booking</h2><p className="admin-notice mb-5">This creates a confirmed appointment without charging the client or collecting an online deposit. Arrange any payment directly with the client. The time must fit working hours and be available.</p>
      <form onSubmit={create}><fieldset disabled={busy} className="space-y-5"><div className="admin-grid">
        <label className="admin-field">Service<select required value={manual.serviceId} onChange={event => setManual({ ...manual, serviceId: event.target.value })}><option value="">Select a service</option>{services.filter(service => service.active).map(service => <option key={service.id} value={service.id}>{service.name}</option>)}</select></label>
        <label className="admin-field">Start (Lagos time)<input required type="datetime-local" step={300} value={manual.startAt} onChange={event => setManual({ ...manual, startAt: event.target.value })} /></label>
        <label className="admin-field">Client name<input required maxLength={120} autoComplete="off" value={manual.name} onChange={event => setManual({ ...manual, name: event.target.value })} /></label>
        <label className="admin-field">Client email<input required type="email" maxLength={254} autoComplete="off" value={manual.email} onChange={event => setManual({ ...manual, email: event.target.value })} /></label>
        <label className="admin-field">Client phone (optional)<input type="tel" maxLength={30} autoComplete="off" value={manual.phone} onChange={event => setManual({ ...manual, phone: event.target.value })} /></label>
      </div><label className="admin-field">Notes<textarea rows={3} maxLength={2000} value={manual.notes} onChange={event => setManual({ ...manual, notes: event.target.value })} /></label><button type="submit" className="admin-button">{busy ? 'Creating…' : 'Create confirmed booking'}</button></fieldset></form>
    </section>}
    <section className="admin-panel"><h2 className="text-xl font-semibold mb-4">Bookings ({filtered.length})</h2>{!filtered.length ? <p className="text-ink-muted">No bookings match these filters.</p> : <div className="overflow-x-auto"><table className="admin-table"><caption className="sr-only">Client bookings. Appointment times use Africa/Lagos.</caption><thead><tr><th scope="col">Client</th><th scope="col">Appointment (Lagos)</th><th scope="col">Service</th><th scope="col">Status</th><th scope="col">Payment</th><th scope="col">Action</th></tr></thead><tbody>{filtered.map(booking => <tr key={booking.id}><th scope="row">{booking.name}<span className="block text-sm font-normal break-all">{booking.email}</span></th><td>{bookingDate(booking.startAt)}</td><td>{booking.serviceName}</td><td className="capitalize">{readable(booking.status)}</td><td>{bookingMoney(booking.paidNGN)} paid<span className="block text-sm capitalize">{readable(booking.paymentStatus)}</span></td><td><button type="button" className="admin-button-secondary" onClick={() => select(booking)} aria-label={`Manage ${booking.name}'s booking on ${bookingDate(booking.startAt)}`}>Manage</button></td></tr>)}</tbody></table></div>}</section>
    {selected && <section className="admin-panel" aria-label="Selected booking"><div className="flex flex-wrap justify-between gap-4 mb-4"><h2 className="text-xl font-semibold">{selected.name} — {selected.serviceName}</h2><button type="button" className="admin-button-secondary" onClick={() => { setSelectedId(null); setPendingAction(null) }}>Close details</button></div>
      <dl className="admin-grid mb-5"><div><dt className="font-semibold">Appointment</dt><dd>{bookingDate(selected.startAt)} – {bookingDate(selected.endAt)}</dd></div><div><dt className="font-semibold">Contact</dt><dd className="break-all">{selected.email}<br />{selected.phone}</dd></div><div><dt className="font-semibold">Payment</dt><dd>{bookingMoney(selected.priceNGN)} total · {bookingMoney(selected.dueNGN)} required · {bookingMoney(selected.paidNGN)} paid<br /><span className="capitalize">{readable(selected.paymentStatus)}</span></dd></div><div><dt className="font-semibold">Notes</dt><dd className="whitespace-pre-wrap">{selected.notes || 'None'}</dd></div></dl>
      <div className="flex flex-wrap gap-3">
        {(selected.status === 'confirmed' || selected.status === 'payment_pending') && <><button type="button" className="admin-button-secondary" disabled={busy} onClick={() => setPendingAction('reschedule')}>Reschedule</button><button type="button" className="admin-button-secondary" disabled={busy} onClick={() => setPendingAction('cancel')}>Cancel booking</button></>}
        {selected.status === 'confirmed' && <><button type="button" className="admin-button-secondary" disabled={busy} onClick={() => setPendingAction('complete')}>Mark completed</button><button type="button" className="admin-button-secondary" disabled={busy} onClick={() => setPendingAction('no_show')}>Mark no-show</button></>}
        {selected.status === 'payment_pending' && selected.paidNGN >= selected.dueNGN && <button type="button" className="admin-button-secondary" disabled={busy} onClick={() => setPendingAction('confirm')}>Confirm booking</button>}
        {paymentConfigured && selected.status === 'cancelled' && selected.paidNGN > 0 && ['paid', 'refund_requested'].includes(selected.paymentStatus) && <button type="button" className="admin-button-secondary" disabled={busy} onClick={() => setPendingAction('refund')}>Request refund</button>}
      </div>
      {pendingAction && <div className="mt-5 p-5 rounded-xl bg-surface-soft space-y-4"><p className="font-semibold">{pendingAction === 'refund' ? `Refund ${bookingMoney(selected.paidNGN)} through the payment provider?` : pendingAction === 'cancel' ? 'Cancel this appointment?' : pendingAction === 'reschedule' ? 'Choose the new appointment time.' : `Change booking status to ${pendingAction === 'complete' ? 'completed' : readable(pendingAction)}?`}</p>
        {pendingAction === 'cancel' && selected.paidNGN > 0 && <p className="text-sm text-ink-muted">Cancelling the appointment does not refund payment. Submit a separate refund request if needed.</p>}
        {pendingAction === 'reschedule' && <label className="admin-field">New start (Lagos time)<input type="datetime-local" value={rescheduleTime} onChange={event => setRescheduleTime(event.target.value)} /></label>}
        <div className="flex flex-wrap gap-3"><button type="button" className="admin-button" disabled={busy || (pendingAction === 'reschedule' && !rescheduleTime)} onClick={act}>{busy ? 'Updating…' : pendingAction === 'refund' ? 'Submit refund' : 'Confirm change'}</button><button type="button" className="admin-button-secondary" disabled={busy} onClick={() => setPendingAction(null)}>Keep current booking</button></div>
      </div>}
    </section>}
    <BookingNotifications />
  </div>
}
