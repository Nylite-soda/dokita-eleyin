import { getManagedBooking } from '@/lib/booking'
import { bookingCalendar } from '@/lib/booking-calendar'
import { bookingApiError } from '@/lib/booking-http'

export async function GET(request: Request) {
  try {
    const token = new URL(request.url).searchParams.get('token') || ''
    return new Response(bookingCalendar(await getManagedBooking(token)), { headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': 'attachment; filename="consultation.ics"', 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' } })
  } catch (error) { return bookingApiError(error) }
}
