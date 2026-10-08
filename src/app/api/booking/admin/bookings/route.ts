import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { assertSameOrigin, requireAdmin } from '@/lib/auth'
import { changeBooking, createBooking, getBookings } from '@/lib/booking'
import { bookingApiError, bookingOrigin, bookingResponse, readBookingBody } from '@/lib/booking-http'
import { dispatchBookingEmails } from '@/lib/booking-mail'

export async function GET() {
  try { await requireAdmin(); return bookingResponse({ bookings: await getBookings() }) } catch (error) { return bookingApiError(error) }
}
export async function POST(request: Request) {
  try {
    assertSameOrigin(request)
    const user = await requireAdmin()
    const body = await readBookingBody(request)
    const parsed = z.record(z.string(), z.unknown()).safeParse(body)
    if (!parsed.success) return bookingResponse({ error: 'Please enter the booking details.' }, 400)
    const result = await createBooking({ ...parsed.data, consent: true, idempotencyKey: randomUUID() }, bookingOrigin(request), user.id)
    await dispatchBookingEmails(1)
    return bookingResponse(result, 201)
  } catch (error) { return bookingApiError(error) }
}
export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request)
    const user = await requireAdmin()
    const parsed = z.object({ id: z.uuid(), action: z.enum(['cancel', 'complete', 'no_show', 'confirm', 'reschedule']), startAt: z.iso.datetime().optional() }).safeParse(await readBookingBody(request))
    if (!parsed.success) return bookingResponse({ error: 'Please check the booking action.' }, 400)
    const booking = await changeBooking(parsed.data.id, parsed.data.action, parsed.data.startAt, user.id)
    await dispatchBookingEmails(1)
    return bookingResponse({ booking })
  } catch (error) { return bookingApiError(error) }
}
