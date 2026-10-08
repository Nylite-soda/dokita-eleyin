import 'server-only'
import { getPrisma } from '@/lib/prisma'
import { getBookingRow, queueBookingEmail } from './booking'
import { emailConfigured, sendEmail } from './email'

const db = getPrisma()
export { emailConfigured }

export async function queueBookingReminders(now = new Date()) {
  const rows = await db.bookings.findMany({ where: { status: 'confirmed', start_at: { gt: now.toISOString(), lte: new Date(now.getTime() + 86_400_000).toISOString() } }, select: { id: true, start_at: true } })
  for (const row of rows) await queueBookingEmail(row.id, 'reminder', undefined, `${row.id}:reminder:${row.start_at}`)
  return rows.length
}

/** Durable queue: claim rows atomically so concurrent workers do not send them twice. */
export async function dispatchBookingEmails(limit = 5) {
  if (!emailConfigured()) return { sent: 0, failed: 0, configured: false }
  const rows = await db.booking_outbox.findMany({ where: { status: 'pending', attempts: { lt: 5 } }, orderBy: { created_at: 'asc' }, take: limit })
  let sent = 0
  let failed = 0
  for (const row of rows) {
    const booking = await getBookingRow(row.booking_id)
    const stale = !booking || (row.event_type !== 'cancelled' && (booking.status === 'cancelled' || row.start_at !== booking.start_at)) || (row.event_type === 'payment_pending' && booking.status !== 'payment_pending') || (row.event_type === 'reminder' && (booking.status !== 'confirmed' || Date.parse(booking.start_at) <= Date.now()))
    if (row.event_type && stale) {
      await db.booking_outbox.updateMany({ where: { id: row.id, status: 'pending' }, data: { status: 'superseded' } })
      continue
    }
    const claimedAt = new Date().toISOString()
    const claimed = await db.booking_outbox.updateMany({ where: { id: row.id, status: 'pending' }, data: { status: 'sending', attempts: { increment: 1 }, claimed_at: claimedAt } })
    if (!claimed.count) continue
    try {
      await sendEmail({ to: { email: row.email }, subject: row.subject, htmlBody: row.html })
      await db.booking_outbox.updateMany({ where: { id: row.id, status: 'sending', claimed_at: claimedAt }, data: { status: 'sent', sent_at: new Date().toISOString(), claimed_at: null } })
      sent++
    } catch {
      await db.booking_outbox.updateMany({ where: { id: row.id, status: 'sending', claimed_at: claimedAt }, data: { status: 'pending', claimed_at: null } })
      failed++
    }
  }
  return { sent, failed, configured: true }
}
