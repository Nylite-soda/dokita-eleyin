import { z } from 'zod'
import { assertSameOrigin, requireAdmin } from '@/lib/auth'
import { refundBookingPayment } from '@/lib/booking-payments'
import { bookingApiError, bookingResponse, readBookingBody } from '@/lib/booking-http'

export async function POST(request: Request) {
  try {
    assertSameOrigin(request)
    const user = await requireAdmin()
    const parsed = z.object({ bookingId: z.uuid() }).safeParse(await readBookingBody(request))
    if (!parsed.success) return bookingResponse({ error: 'Choose a valid booking to refund.' }, 400)
    return bookingResponse({ booking: await refundBookingPayment(parsed.data.bookingId, user.id) })
  } catch (error) { return bookingApiError(error) }
}
