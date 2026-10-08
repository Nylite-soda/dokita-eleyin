import { z } from 'zod'
import { getManagedBooking, getSlots } from '@/lib/booking'
import { bookingApiError, bookingResponse } from '@/lib/booking-http'

export const runtime = 'nodejs'
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const serviceId = url.searchParams.get('serviceId') || ''
    const date = url.searchParams.get('date') || ''
    if (!z.uuid().safeParse(serviceId).success || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return bookingResponse({ error: 'Choose a service and a valid date.' }, 400)
    const token = url.searchParams.get('token')
    const booking = token ? await getManagedBooking(token) : undefined
    if (booking && booking.serviceId !== serviceId) return bookingResponse({ error: 'This service does not match your booking.' }, 400)
    return bookingResponse({ slots: await getSlots(serviceId, date, booking?.id) })
  } catch (error) { return bookingApiError(error) }
}
