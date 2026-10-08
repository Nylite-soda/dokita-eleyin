import { assertSameOrigin, rateLimit } from '@/lib/auth'
import { createBooking, getAvailability, getServices, guestBookingSchema, paymentConfigured } from '@/lib/booking'
import { bookingApiError, bookingOrigin, bookingResponse, readBookingBody } from '@/lib/booking-http'
import { dispatchBookingEmails, emailConfigured } from '@/lib/booking-mail'

export const runtime = 'nodejs'
export async function GET() {
  const [availability, services] = await Promise.all([getAvailability(), getServices(false)])
  return bookingResponse({ services: services.filter(service => !service.depositNGN || paymentConfigured()), availability: { timezone: availability.timezone, minNoticeHours: availability.minNoticeHours, windowDays: availability.windowDays, cancellationNoticeHours: availability.cancellationNoticeHours, cancellationPolicy: availability.cancellationPolicy }, paymentConfigured: paymentConfigured() })
}
export async function POST(request: Request) {
  try {
    assertSameOrigin(request)
    await rateLimit(`booking-create:${request.headers.get('x-forwarded-for')?.split(',')[0] || 'local'}`, 20, 3600)
    const body = await readBookingBody(request)
    const parsed = guestBookingSchema.safeParse(body)
    if (parsed.success) await rateLimit(`booking-email:${parsed.data.email}`, 5, 3600)
    const result = await createBooking(body, bookingOrigin(request))
    await dispatchBookingEmails(1)
    return bookingResponse({ ...result, emailConfigured: emailConfigured() }, result.duplicate ? 200 : 201)
  } catch (error) { return bookingApiError(error) }
}
