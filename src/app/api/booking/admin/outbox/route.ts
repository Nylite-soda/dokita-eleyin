import { assertSameOrigin, requireAdmin } from '@/lib/auth'
import { getPrisma } from '@/lib/prisma'
import { bookingApiError, bookingResponse } from '@/lib/booking-http'
import { dispatchBookingEmails, emailConfigured, queueBookingReminders } from '@/lib/booking-mail'
import { logAudit } from '@/lib/audit'

export async function GET() {
  try {
    await requireAdmin()
    const items = await getPrisma().booking_outbox.findMany({ select: { id: true, booking_id: true, email: true, subject: true, status: true, attempts: true, created_at: true, sent_at: true }, orderBy: { created_at: 'desc' }, take: 100 })
    return bookingResponse({ items, emailConfigured: emailConfigured() })
  } catch (error) { return bookingApiError(error) }
}
export async function POST(request: Request) {
  try {
    assertSameOrigin(request)
    const user = await requireAdmin()
    // Explicit retry recovers exhausted or interrupted deliveries. Provider
    // timeouts can leave delivery uncertain; staff should check logs before retry.
    const db = getPrisma()
    await db.booking_outbox.updateMany({ where: { OR: [{ status: 'pending' }, { status: 'sending', OR: [{ claimed_at: null }, { claimed_at: { lt: new Date(Date.now() - 300_000).toISOString() } }] }] }, data: { status: 'pending', attempts: 0, claimed_at: null } })
    await logAudit(user.id, 'booking.email.retry', 'outbox')
    await queueBookingReminders()
    return bookingResponse(await dispatchBookingEmails(10))
  } catch (error) { return bookingApiError(error) }
}
