import { z } from 'zod'
import { assertSameOrigin, requireAdmin } from '@/lib/auth'
import { BookingError, getServices, paymentConfigured, saveService } from '@/lib/booking'
import { bookingApiError, bookingResponse, readBookingBody } from '@/lib/booking-http'

export async function GET() {
  try { await requireAdmin(); return bookingResponse({ services: await getServices(), paymentConfigured: paymentConfigured() }) } catch (error) { return bookingApiError(error) }
}
export async function POST(request: Request) {
  try { assertSameOrigin(request); const user = await requireAdmin(); return bookingResponse({ service: await saveService(await readBookingBody(request), user.id) }, 201) } catch (error) { return bookingApiError(error) }
}
export async function PATCH(request: Request) {
  try {
    assertSameOrigin(request)
    const user = await requireAdmin()
    const body = await readBookingBody(request)
    const parsed = z.object({ id: z.uuid() }).safeParse(body)
    if (!parsed.success) throw new BookingError('Choose a valid service.')
    if (!(await getServices()).some(service => service.id === parsed.data.id)) throw new BookingError('Service not found.', 404)
    return bookingResponse({ service: await saveService(body, user.id, parsed.data.id) })
  } catch (error) { return bookingApiError(error) }
}
