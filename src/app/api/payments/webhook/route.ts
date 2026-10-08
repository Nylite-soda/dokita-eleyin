import { processPaystackEvent, validPaystackSignature } from '@/lib/booking-payments'
import { bookingApiError, bookingResponse } from '@/lib/booking-http'
import { dispatchBookingEmails } from '@/lib/booking-mail'

export const runtime = 'nodejs'
export async function POST(request: Request) {
  try {
    const text = await request.text()
    if (text.length > 100_000) return bookingResponse({ error: 'Payload too large.' }, 413)
    if (!validPaystackSignature(text, request.headers.get('x-paystack-signature'))) return bookingResponse({ error: 'Invalid payment signature.' }, 401)
    await processPaystackEvent(JSON.parse(text))
    await dispatchBookingEmails(1)
    return bookingResponse({ received: true })
  } catch (error) { return bookingApiError(error) }
}
