import { z } from 'zod'
import { assertSameOrigin, rateLimit } from '@/lib/auth'
import { changeBooking, getManagedBooking } from '@/lib/booking'
import { bookingApiError, bookingResponse, readBookingBody } from '@/lib/booking-http'
import { dispatchBookingEmails } from '@/lib/booking-mail'

const schema = z.object({ token: z.string().length(43), action: z.enum(['cancel', 'reschedule']), startAt: z.iso.datetime().optional() })
export async function POST(request: Request) {
  try {
    assertSameOrigin(request)
    await rateLimit(`booking-manage:${request.headers.get('x-forwarded-for')?.split(',')[0] || 'local'}`, 60, 3600)
    const parsed = schema.safeParse(await readBookingBody(request))
    if (!parsed.success) return bookingResponse({ error: 'Please check your booking action.' }, 400)
    const booking = await getManagedBooking(parsed.data.token)
    const updated = await changeBooking(booking.id, parsed.data.action, parsed.data.startAt)
    await dispatchBookingEmails(1)
    return bookingResponse({ booking: updated })
  } catch (error) { return bookingApiError(error) }
}
