import { z } from 'zod'
import { assertSameOrigin, rateLimit } from '@/lib/auth'
import { initializeBookingPayment } from '@/lib/booking-payments'
import { bookingApiError, bookingOrigin, bookingResponse, readBookingBody } from '@/lib/booking-http'

export async function POST(request: Request) {
  try {
    assertSameOrigin(request)
    const parsed = z.object({ token: z.string().length(43) }).safeParse(await readBookingBody(request))
    if (!parsed.success) return bookingResponse({ error: 'Use your private booking link to pay.' }, 400)
    rateLimit(`payment-init:${parsed.data.token}`, 10, 900)
    return bookingResponse({ url: await initializeBookingPayment(parsed.data.token, bookingOrigin(request)) })
  } catch (error) { return bookingApiError(error) }
}
