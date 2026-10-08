import { createHash, timingSafeEqual } from 'node:crypto'
import { bookingResponse } from '@/lib/booking-http'
import { dispatchBookingEmails, queueBookingReminders } from '@/lib/booking-mail'

export const runtime = 'nodejs'
export const maxDuration = 120
export async function POST(request: Request) {
  const configured = process.env.BOOKING_CRON_SECRET
  const received = request.headers.get('authorization')?.replace(/^Bearer /, '')
  if (!configured || configured.length < 32 || !received || !timingSafeEqual(createHash('sha256').update(configured).digest(), createHash('sha256').update(received).digest())) return bookingResponse({ error: 'Unauthorized notification worker.' }, 401)
  await queueBookingReminders()
  return bookingResponse(await dispatchBookingEmails(5))
}
