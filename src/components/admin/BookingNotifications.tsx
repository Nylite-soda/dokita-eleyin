'use client'
import { useState } from 'react'
import { bookingAdminError, bookingAdminRequest, bookingDate } from './booking-api'

interface NotificationItem { id: string; booking_id: string; email: string; subject: string; status: 'pending' | 'sending' | 'sent'; attempts: number; created_at: string; sent_at: string | null }
interface NotificationsResponse { items: NotificationItem[]; emailConfigured: boolean }

export default function BookingNotifications() {
  const [data, setData] = useState<NotificationsResponse | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  async function load() {
    setBusy(true); setError('')
    try { setData(await bookingAdminRequest<NotificationsResponse>('/api/booking/admin/outbox')) }
    catch (cause) { setError(bookingAdminError(cause)) } finally { setBusy(false) }
  }
  async function retry() {
    setBusy(true); setError(''); setStatus('')
    try {
      const result = await bookingAdminRequest<{ sent: number; failed: number; configured: boolean }>('/api/booking/admin/outbox', 'POST', {})
      setData(await bookingAdminRequest<NotificationsResponse>('/api/booking/admin/outbox'))
      setStatus(result.configured ? `${result.sent} email(s) accepted by the provider. ${result.failed} attempt(s) failed.` : 'Email delivery is not configured. Messages remain queued.')
    } catch (cause) { setError(bookingAdminError(cause)) } finally { setBusy(false) }
  }
  return <section className="admin-panel"><div className="flex flex-wrap justify-between items-center gap-4 mb-4"><h2 className="text-xl font-semibold">Booking notifications</h2><button type="button" className="admin-button-secondary" disabled={busy} onClick={load}>{busy ? 'Loading…' : data ? 'Refresh delivery status' : 'Show delivery status'}</button></div>
    <p className="text-ink-muted mb-4">Appointment emails are queued separately from booking changes. Provider acceptance does not confirm delivery to the recipient&apos;s inbox.</p>
    {data && <><p className="admin-notice mb-4">Email provider: {data.emailConfigured ? 'configured' : 'not configured'}. Before retrying a message after a timeout, check provider logs to avoid sending duplicates.</p>
      {data.items.some(item => item.status !== 'sent') && <button type="button" disabled={busy || !data.emailConfigured} className="admin-button mb-4" onClick={retry}>Retry queued emails (up to 10)</button>}
      {!data.items.length ? <p className="text-ink-muted">No booking notifications have been queued.</p> : <div className="overflow-x-auto"><table className="admin-table"><thead><tr><th scope="col">Recipient / subject</th><th scope="col">Status</th><th scope="col">Attempts</th><th scope="col">Created (Lagos)</th></tr></thead><tbody>{data.items.map(item => <tr key={item.id}><td className="break-all">{item.email}<span className="block text-sm">{item.subject}</span></td><td>{item.status}</td><td>{item.attempts}</td><td>{bookingDate(item.created_at)}</td></tr>)}</tbody></table></div>}</>}
    {error && <p className="admin-error mt-4" role="alert">{error}</p>}<p className="mt-4 text-brand-darkBlue" role="status">{status}</p>
  </section>
}
