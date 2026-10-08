import 'server-only'
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import { z } from 'zod'
import { getPrisma } from '@/lib/prisma'
import { BookingError, getBookingRow, getManagedBooking, mapBooking, paymentConfigured, queueBookingEmail, runBookingTransaction } from './booking'
import { overlaps } from './booking-slots'

const db = getPrisma()
async function audit(action: string, targetId: string, details: Record<string, unknown> = {}) {
  await db.audit_log.create({ data: { id: randomUUID(), user_id: null, action, target_id: targetId, details: JSON.stringify(details), created_at: new Date().toISOString() } })
}
async function paystack(path: string, body?: unknown): Promise<unknown> {
  if (!paymentConfigured()) throw new BookingError('Online payments are currently unavailable.', 503)
  const response = await fetch(`https://api.paystack.co${path}`, { method: body ? 'POST' : 'GET', headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(12_000) })
  if (!response.ok) throw new BookingError('The payment provider could not complete this request. Please try again.', 502)
  return response.json()
}

export async function initializeBookingPayment(token: string, siteOrigin: string): Promise<string> {
  const booking = await getManagedBooking(token)
  if (booking.status !== 'payment_pending' || booking.dueNGN <= 0) throw new BookingError('This booking does not require a pending payment.', 409)
  if (!booking.holdExpiresAt || booking.holdExpiresAt <= new Date().toISOString()) throw new BookingError('Your payment hold has expired. Please choose a new appointment.', 409)
  if (!paymentConfigured()) throw new BookingError('Online payments are currently unavailable.', 503)
  const existing = await getBookingRow(booking.id)
  if (!existing) throw new BookingError('Booking not found.', 404)
  if (existing.payment_url) return existing.payment_url
  if (existing.payment_reference && existing.payment_init_started_at && Date.parse(existing.payment_init_started_at) > Date.now() - 30_000) throw new BookingError('Payment is being prepared. Please try again in a moment.', 409)
  const reference = existing.payment_reference || `dokita-${randomUUID()}`
  const leaseStartedAt = new Date().toISOString()
  const claimed = existing.payment_reference
    ? await db.bookings.updateMany({ where: { id: booking.id, payment_reference: reference, payment_url: null, status: 'payment_pending', OR: [{ payment_init_started_at: null }, { payment_init_started_at: { lte: new Date(Date.now() - 30_000).toISOString() } }] }, data: { payment_init_started_at: leaseStartedAt } })
    : await db.bookings.updateMany({ where: { id: booking.id, payment_reference: null, paid_ngn: 0, status: 'payment_pending' }, data: { payment_reference: reference, payment_status: 'pending', payment_init_started_at: leaseStartedAt } })
  if (!claimed.count) throw new BookingError('Payment is being prepared. Please try again in a moment.', 409)
  try {
    const result = z.object({ status: z.literal(true), data: z.object({ authorization_url: z.url(), reference: z.string() }) }).parse(await paystack('/transaction/initialize', { email: booking.email, amount: booking.dueNGN * 100, currency: 'NGN', reference, callback_url: `${siteOrigin}/booking/${token}?payment=return`, metadata: JSON.stringify({ bookingId: booking.id }) }))
    const checkout = new URL(result.data.authorization_url)
    if (result.data.reference !== reference || checkout.protocol !== 'https:' || checkout.hostname !== 'checkout.paystack.com') throw new BookingError('The payment provider returned an invalid checkout link.', 502)
    const saved = await db.bookings.updateMany({ where: { id: booking.id, payment_reference: reference, payment_init_started_at: leaseStartedAt, status: 'payment_pending', hold_expires_at: { gt: new Date().toISOString() } }, data: { payment_url: checkout.href } })
    if (!saved.count) throw new BookingError('Your payment hold has ended. Please return to your booking page.', 409)
    return checkout.href
  } catch (error) {
    if (error instanceof BookingError) throw error
    throw new BookingError('Checkout could not be prepared. Check your payment status before starting a new booking.', 502)
  }
}

const successfulCharge = z.object({ id: z.number().int().optional(), status: z.literal('success'), reference: z.string(), amount: z.number().int(), currency: z.literal('NGN'), customer: z.object({ email: z.email() }) })
export async function acceptVerifiedCharge(input: unknown) {
  const parsed = successfulCharge.safeParse(input)
  if (!parsed.success) throw new BookingError('This payment has not been completed.', 409)
  const data = parsed.data
  return runBookingTransaction(async tx => {
    await tx.$executeRaw`UPDATE booking_configuration SET id=id WHERE id=1`
    const row = await tx.bookings.findUnique({ where: { payment_reference: data.reference } })
    if (!row) throw new BookingError('The payment does not match a booking.', 404)
    const booking = mapBooking(row as unknown as Record<string, unknown>)
    if (data.amount !== booking.dueNGN * 100 || data.customer.email.toLowerCase() !== booking.email || booking.dueNGN <= 0) throw new BookingError('The payment amount or customer does not match the booking.', 409)
    if (booking.paidNGN > 0) return booking
    const occupied = await tx.bookings.findMany({ where: { id: { not: booking.id }, OR: [{ status: 'confirmed' }, { status: 'payment_pending', hold_expires_at: { gt: new Date().toISOString() } }] }, select: { start_at: true, occupied_until: true } })
    const conflict = occupied.some(period => overlaps(Date.parse(booking.startAt), Date.parse(row.occupied_until), { startAt: period.start_at, endAt: period.occupied_until }))
    const canConfirm = booking.status === 'payment_pending' && Date.parse(booking.startAt) > Date.now() && !conflict
    const now = new Date().toISOString()
    const updated = await tx.bookings.update({ where: { id: booking.id }, data: { paid_ngn: booking.dueNGN, payment_status: canConfirm ? 'paid' : 'refund_requested', status: canConfirm ? 'confirmed' : 'cancelled', payment_transaction_id: data.id === undefined ? null : String(data.id), hold_expires_at: null, updated_at: now } })
    await tx.booking_payment_events.create({ data: { id: `charge:${data.reference}`, created_at: now } })
    await queueBookingEmail(booking.id, canConfirm ? 'confirmed' : 'cancelled', undefined, undefined, tx)
    await tx.audit_log.create({ data: { id: randomUUID(), user_id: null, action: 'booking.payment.verified', target_id: booking.id, details: JSON.stringify({ amountNGN: booking.dueNGN, confirmed: canConfirm }), created_at: now } })
    return mapBooking(updated as unknown as Record<string, unknown>)
  })
}

export async function verifyBookingPayment(token: string) {
  const booking = await getManagedBooking(token)
  const row = await getBookingRow(booking.id)
  if (booking.paidNGN > 0) return booking
  if (!row?.payment_reference) throw new BookingError('No payment has been started for this booking.', 409)
  const result = z.object({ status: z.literal(true), data: z.unknown() }).parse(await paystack(`/transaction/verify/${encodeURIComponent(row.payment_reference)}`))
  return acceptVerifiedCharge(result.data)
}

export function validPaystackSignature(payload: string, signature: string | null): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret || !signature || !/^[a-f0-9]{128}$/i.test(signature)) return false
  const expected = createHmac('sha512', secret).update(payload).digest()
  const received = Buffer.from(signature, 'hex')
  return expected.length === received.length && timingSafeEqual(expected, received)
}

export async function refundBookingPayment(bookingId: string, userId: string) {
  const row = await getBookingRow(bookingId)
  if (!row) throw new BookingError('Booking not found.', 404)
  const booking = mapBooking(row as unknown as Record<string, unknown>)
  if (booking.status !== 'cancelled') throw new BookingError('Cancel the booking before issuing a refund.', 409)
  if (booking.paymentStatus === 'refunded' || booking.paymentStatus === 'refund_pending') return booking
  if (booking.paidNGN <= 0 || !row.payment_reference) throw new BookingError('There is no verified payment to refund.', 409)
  if (row.refund_id && booking.paymentStatus === 'refund_requested') throw new BookingError('Review and retry this existing refund in the Paystack dashboard to avoid issuing it twice.', 409)
  if (!paymentConfigured()) throw new BookingError('Online payment processing is not configured.', 503)
  const claimed = await db.bookings.updateMany({ where: { id: bookingId, payment_status: { in: ['paid', 'refund_requested'] } }, data: { payment_status: 'refund_pending' } })
  if (!claimed.count) throw new BookingError('A refund is already being processed.', 409)
  await db.audit_log.create({ data: { id: randomUUID(), user_id: userId, action: 'booking.refund.requested', target_id: bookingId, details: JSON.stringify({ amountNGN: booking.paidNGN }), created_at: new Date().toISOString() } })
  try {
    const result = z.object({ status: z.literal(true), data: z.object({ id: z.number().int(), status: z.string() }) }).parse(await paystack('/refund', { transaction: row.payment_reference, amount: booking.paidNGN * 100, currency: 'NGN', customer_note: 'Cancelled consultation' }))
    await db.bookings.updateMany({ where: { id: bookingId, payment_status: { not: 'refunded' }, OR: [{ refund_id: null }, { refund_id: String(result.data.id) }] }, data: { refund_id: String(result.data.id), payment_status: result.data.status === 'processed' ? 'refunded' : 'refund_pending', updated_at: new Date().toISOString() } })
    const updated = await getBookingRow(bookingId)
    return mapBooking(updated as unknown as Record<string, unknown>)
  } catch {
    throw new BookingError('Refund status is uncertain. Check the Paystack dashboard before taking further action.', 502)
  }
}

export async function processPaystackEvent(input: unknown) {
  const event = z.object({ event: z.string(), data: z.unknown() }).safeParse(input)
  if (!event.success) throw new BookingError('Invalid payment event.')
  if (event.data.event === 'charge.success') return acceptVerifiedCharge(event.data.data)
  if (!['refund.processed', 'refund.failed', 'refund.pending', 'refund.processing'].includes(event.data.event)) return
  const parsed = z.object({ id: z.number().int(), amount: z.number().int(), currency: z.literal('NGN'), transaction: z.union([z.number(), z.object({ reference: z.string() })]) }).safeParse(event.data.data)
  if (!parsed.success) return
  const transaction = parsed.data.transaction
  const matched = await db.bookings.findFirst({ where: { OR: [
    { refund_id: String(parsed.data.id) },
    ...(typeof transaction === 'number' ? [{ payment_transaction_id: String(transaction), payment_status: 'refund_pending', refund_id: null }] : [{ payment_reference: transaction.reference, payment_status: 'refund_pending', refund_id: null }]),
  ] } })
  if (!matched || matched.status !== 'cancelled' || matched.paid_ngn * 100 !== parsed.data.amount || (matched.refund_id && matched.refund_id !== String(parsed.data.id))) return
  const status = event.data.event === 'refund.processed' ? 'refunded' : event.data.event === 'refund.failed' ? 'refund_requested' : 'refund_pending'
  if (matched.payment_status === 'refunded') return
  await db.bookings.update({ where: { id: matched.id }, data: { refund_id: String(parsed.data.id), payment_status: status, updated_at: new Date().toISOString() } })
  await audit(`booking.${event.data.event}`, matched.id)
}
