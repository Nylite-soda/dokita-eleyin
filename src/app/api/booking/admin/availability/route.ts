import { assertSameOrigin, requireAdmin } from '@/lib/auth'
import { getAvailability, saveAvailability } from '@/lib/booking'
import { bookingApiError, bookingResponse, readBookingBody } from '@/lib/booking-http'

export async function GET() {
  try { await requireAdmin(); return bookingResponse({ availability: await getAvailability() }) } catch (error) { return bookingApiError(error) }
}
export async function PUT(request: Request) {
  try { assertSameOrigin(request); const user = await requireAdmin(); return bookingResponse({ availability: await saveAvailability(await readBookingBody(request), user.id) }) } catch (error) { return bookingApiError(error) }
}
