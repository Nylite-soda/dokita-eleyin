import { BookingError } from './booking'
import { apiError } from './auth'

export async function readBookingBody(request: Request): Promise<unknown> {
  try {
    const text = await request.text()
    if (text.length > 30_000) throw new BookingError('The request is too large.', 413)
    return JSON.parse(text)
  } catch (error) {
    if (error instanceof BookingError) throw error
    throw new BookingError('The request could not be read. Please try again.')
  }
}
export function bookingResponse(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' } })
}
export function bookingApiError(error: unknown): Response {
  if (error instanceof BookingError) return bookingResponse({ error: error.message }, error.status)
  return apiError(error)
}
export function bookingOrigin(request: Request): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error()
    return parsed.origin
  } catch { throw new BookingError('The booking website URL is not configured correctly.', 503) }
}
