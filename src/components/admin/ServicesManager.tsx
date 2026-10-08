'use client'
import { FormEvent, useState } from 'react'
import type { BookingService } from '@/lib/booking-types'
import { bookingAdminError, bookingAdminRequest, bookingMoney } from './booking-api'

type ServiceDraft = { name: string; description: string; durationMinutes: number; bufferMinutes: number; price: string; deposit: string; active: boolean }
const emptyDraft: ServiceDraft = { name: '', description: '', durationMinutes: 30, bufferMinutes: 10, price: '', deposit: '', active: false }

export default function ServicesManager({ initialServices, paymentConfigured }: { initialServices: BookingService[]; paymentConfigured: boolean }) {
  const [services, setServices] = useState(initialServices)
  const [draft, setDraft] = useState<ServiceDraft>(emptyDraft)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function edit(service: BookingService) {
    setEditingId(service.id)
    setDraft({ name: service.name, description: service.description, durationMinutes: service.durationMinutes, bufferMinutes: service.bufferMinutes, price: service.priceNGN === null ? '' : String(service.priceNGN), deposit: service.depositNGN === null ? '' : String(service.depositNGN), active: service.active })
    setError(''); setStatus('')
  }
  function clear() { setEditingId(null); setDraft(emptyDraft); setError('') }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setStatus('')
    const priceNGN = draft.price === '' ? null : Number(draft.price)
    const depositNGN = draft.deposit === '' ? null : Number(draft.deposit)
    if (priceNGN !== null && depositNGN !== null && depositNGN > priceNGN) { setError('The deposit cannot exceed the full price.'); return }
    if (draft.active && priceNGN === null) { setError('Set a price before making this service available. Use 0 for a free service.'); return }
    if (draft.active && (depositNGN || 0) > 0 && !paymentConfigured) { setError('Configure the payment provider before activating a service with a required deposit.'); return }
    setBusy(true)
    try {
      await bookingAdminRequest('/api/booking/admin/services', editingId ? 'PATCH' : 'POST', { ...(editingId ? { id: editingId } : {}), name: draft.name.trim(), description: draft.description.trim(), durationMinutes: draft.durationMinutes, bufferMinutes: draft.bufferMinutes, priceNGN, depositNGN, active: draft.active })
      const result = await bookingAdminRequest<{ services: BookingService[] }>('/api/booking/admin/services')
      setServices(result.services); clear(); setStatus('Service saved.')
    } catch (cause) { setError(bookingAdminError(cause)) } finally { setBusy(false) }
  }

  return <div className="space-y-6">
    <div className="admin-notice">Payments: {paymentConfigured ? 'configured' : 'not configured'}. Prices and deposits are in Nigerian naira. A service must have an explicit price before it can be offered.</div>
    <section className="admin-panel"><h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit service' : 'Add a service'}</h2>
      <form onSubmit={submit} className="space-y-5">
        <fieldset disabled={busy} className="space-y-5">
          <div className="admin-grid">
            <label className="admin-field">Service name<input required maxLength={120} value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} /></label>
            <label className="admin-field">Duration (minutes)<input type="number" required min={15} max={240} step={1} value={draft.durationMinutes} onChange={event => setDraft({ ...draft, durationMinutes: Number(event.target.value) })} /></label>
            <label className="admin-field">Buffer after appointment (minutes)<input type="number" required min={0} max={120} step={1} value={draft.bufferMinutes} onChange={event => setDraft({ ...draft, bufferMinutes: Number(event.target.value) })} /></label>
            <label className="admin-field">Full price (NGN)<input type="number" min={0} max={10000000} step={1} placeholder="Set an amount, or 0 for free" value={draft.price} onChange={event => setDraft({ ...draft, price: event.target.value })} /></label>
            <label className="admin-field">Required deposit (NGN)<input type="number" min={0} max={10000000} step={1} placeholder="Leave blank for no advance payment" value={draft.deposit} onChange={event => setDraft({ ...draft, deposit: event.target.value })} /></label>
          </div>
          <label className="admin-field">Description<textarea rows={3} maxLength={1200} value={draft.description} onChange={event => setDraft({ ...draft, description: event.target.value })} /></label>
          <label className="flex items-center gap-3"><input type="checkbox" checked={draft.active} onChange={event => setDraft({ ...draft, active: event.target.checked })} />Available for booking</label>
          <div className="flex flex-wrap gap-3"><button className="admin-button" type="submit">{busy ? 'Saving…' : 'Save service'}</button>{editingId && <button type="button" className="admin-button-secondary" onClick={clear}>Cancel editing</button>}</div>
        </fieldset>
      </form>
      {error && <p role="alert" className="admin-error mt-4">{error}</p>}<p role="status" className="mt-4 text-brand-darkBlue">{status}</p>
    </section>
    <section className="admin-panel"><h2 className="text-xl font-semibold mb-4">Services</h2>{!services.length ? <p className="text-ink-muted">Add a service to begin configuring bookings.</p> : <div className="overflow-x-auto"><table className="admin-table"><thead><tr><th scope="col">Service</th><th scope="col">Timing</th><th scope="col">Price / deposit</th><th scope="col">Status</th><th scope="col">Action</th></tr></thead><tbody>{services.map(service => <tr key={service.id}><th scope="row">{service.name}</th><td>{service.durationMinutes} min + {service.bufferMinutes} min buffer</td><td>{service.priceNGN === null ? 'Not set' : bookingMoney(service.priceNGN)} / {bookingMoney(service.depositNGN || 0)}</td><td>{service.active ? 'Available' : 'Inactive'}</td><td><button type="button" className="admin-button-secondary" onClick={() => edit(service)} disabled={busy} aria-label={`Edit ${service.name}`}>Edit</button></td></tr>)}</tbody></table></div>}</section>
  </div>
}
