import { z } from 'zod'
import { assertSameOrigin, rateLimit } from '@/lib/auth'
import { verifyBookingPayment } from '@/lib/booking-payments'
import { bookingApiError, bookingResponse, readBookingBody } from '@/lib/booking-http'
import { dispatchBookingEmails } from '@/lib/booking-mail'

export async function POST(request: Request) {
  try {
    assertSameOrigin(request)
    const parsed = z.object({ token: z.string().length(43) }).safeParse(await readBookingBody(request))
    if (!parsed.success) return bookingResponse({ error: 'Use your private booking link to check payment.' }, 400)
    rateLimit(`payment-verify:${parsed.data.token}`, 30, 900)
    const booking = await verifyBookingPayment(parsed.data.token)
    await dispatchBookingEmails(1)
    return bookingResponse({ booking })
  } catch (error) { return bookingApiError(error) }
}
