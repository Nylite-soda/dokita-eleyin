import 'server-only'
import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { z } from 'zod'
import { getPrisma } from '@/lib/prisma'
import type { Prisma } from '@/generated/postgres/client'
import { generateSlots, localDate } from './booking-slots'
import type { Availability, Booking, BookingService, BookingStatus, OccupiedPeriod, PaymentStatus } from './booking-types'

export class BookingError extends Error {
  constructor(message: string, public status = 400) { super(message) }
}
export async function runBookingTransaction<T>(work: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try { return await db.$transaction(work, { maxWait: 10000, timeout: 15000 }) }
    catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const code = (error as { code?: string }).code
      const busy = code === 'P1008' || code === 'P2028' || code === 'P2034' || /SQLITE_BUSY|database is locked|database table is locked|40P01|40001/i.test(message)
      if (!busy) throw error
      if (attempt >= 4) throw new BookingError('The booking calendar is busy. Please try again in a moment.', 409)
      await new Promise(resolve => setTimeout(resolve, 50 * 2 ** attempt))
    }
  }
}
export const paymentConfigured = () => Boolean(process.env.PAYSTACK_SECRET_KEY && process.env.NEXT_PUBLIC_SITE_URL?.startsWith('https://'))
const db = getPrisma()
type BookingClient = Pick<typeof db, 'bookings' | 'booking_configuration' | 'booking_hours' | 'booking_blackouts' | 'booking_outbox' | 'audit_log'>

const mapService = (row: { id: string; name: string; description: string; duration_minutes: number; buffer_minutes: number; price_ngn: number | null; deposit_ngn: number | null; active: number }): BookingService => ({ id: row.id, name: row.name, description: row.description, durationMinutes: row.duration_minutes, bufferMinutes: row.buffer_minutes, priceNGN: row.price_ngn, depositNGN: row.deposit_ngn, active: row.active === 1 })
export const mapBooking = (row: Record<string, unknown>): Booking => ({ id: String(row.id), serviceId: String(row.service_id), serviceName: String(row.service_name), name: String(row.name), email: String(row.email), phone: String(row.phone), notes: String(row.notes), timezone: String(row.timezone), startAt: String(row.start_at), endAt: String(row.end_at), status: String(row.status) as BookingStatus, paymentStatus: String(row.payment_status) as PaymentStatus, priceNGN: Number(row.price_ngn), dueNGN: Number(row.due_ngn), paidNGN: Number(row.paid_ngn), createdAt: String(row.created_at), holdExpiresAt: row.hold_expires_at == null ? null : String(row.hold_expires_at) })

export async function getServices(includeInactive = true): Promise<BookingService[]> {
  const rows = await db.booking_services.findMany({ where: includeInactive ? undefined : { active: 1, price_ngn: { not: null } }, orderBy: { name: 'asc' } })
  return rows.map(mapService)
}
export async function getAvailability(): Promise<Availability> {
  const config = await db.booking_configuration.upsert({ where: { id: 1 }, create: { id: 1 }, update: {} })
  const [hours, blackouts] = await Promise.all([db.booking_hours.findMany({ orderBy: [{ weekday: 'asc' }, { start: 'asc' }] }), db.booking_blackouts.findMany({ orderBy: { start_at: 'asc' } })])
  return { timezone: 'Africa/Lagos', minNoticeHours: config.min_notice_hours, windowDays: config.window_days, cancellationNoticeHours: config.cancellation_notice_hours, cancellationPolicy: config.cancellation_policy, hours: hours.map(row => ({ weekday: row.weekday, start: row.start, end: row.end })), blackouts: blackouts.map(row => ({ id: row.id, startAt: row.start_at, endAt: row.end_at, reason: row.reason })) }
}
export async function getBookings(): Promise<Booking[]> { return (await db.bookings.findMany({ orderBy: { start_at: 'desc' } })).map(row => mapBooking(row as unknown as Record<string, unknown>)) }
export async function getBookingRow(id: string) { return db.bookings.findUnique({ where: { id } }) }
export function tokenHash(token: string): string { return createHash('sha256').update(token).digest('hex') }
export async function getManagedBooking(token: string): Promise<Booking> {
  if (!/^[a-zA-Z0-9_-]{43}$/.test(token)) throw new BookingError('This booking link is invalid or expired.', 404)
  const row = await db.bookings.findUnique({ where: { token_hash: tokenHash(token) } })
  if (!row) throw new BookingError('This booking link is invalid or expired.', 404)
  return mapBooking(row as unknown as Record<string, unknown>)
}
export async function getOccupied(excludeId = ''): Promise<OccupiedPeriod[]> {
  const now = new Date().toISOString()
  const rows = await db.bookings.findMany({ where: { id: { not: excludeId }, OR: [{ status: 'confirmed' }, { status: 'payment_pending', hold_expires_at: { gt: now } }] }, select: { start_at: true, occupied_until: true } })
  return rows.map(row => ({ startAt: row.start_at, endAt: row.occupied_until }))
}
export async function getSlots(serviceId: string, date: string, excludeId = '') {
  let service = (await getServices(false)).find(item => item.id === serviceId)
  if (!service || (service.depositNGN && !paymentConfigured())) return []
  if (excludeId) {
    const original = await getBookingRow(excludeId)
    if (!original || original.service_id !== serviceId) return []
    service = { ...service, durationMinutes: (Date.parse(original.end_at) - Date.parse(original.start_at)) / 60_000, bufferMinutes: (Date.parse(original.occupied_until) - Date.parse(original.end_at)) / 60_000 }
  }
  try { return generateSlots(date, service, await getAvailability(), await getOccupied(excludeId)) } catch { return [] }
}

export const serviceSchema = z.object({
  name: z.string().trim().min(2).max(120), description: z.string().trim().max(1200).default(''),
  durationMinutes: z.number().int().min(15).max(240), bufferMinutes: z.number().int().min(0).max(120),
  priceNGN: z.number().int().min(0).max(10_000_000).nullable(), depositNGN: z.number().int().min(0).max(10_000_000).nullable(), active: z.boolean(),
}).superRefine((service, context) => {
  if (service.active && service.priceNGN === null) context.addIssue({ code: 'custom', message: 'Set a fee (zero for free) before activating a service.', path: ['priceNGN'] })
  if (service.depositNGN && (service.priceNGN === null || service.depositNGN > service.priceNGN)) context.addIssue({ code: 'custom', message: 'The deposit cannot exceed the fee.', path: ['depositNGN'] })
  if (service.active && service.depositNGN && !paymentConfigured()) context.addIssue({ code: 'custom', message: 'Configure Paystack and the HTTPS site URL before requiring a deposit.', path: ['depositNGN'] })
})
const time = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
export const availabilitySchema = z.object({
  timezone: z.literal('Africa/Lagos').default('Africa/Lagos'), minNoticeHours: z.number().int().min(0).max(336), windowDays: z.number().int().min(1).max(365),
  cancellationNoticeHours: z.number().int().min(0).max(336).default(0), cancellationPolicy: z.string().trim().max(2000).default(''),
  hours: z.array(z.object({ weekday: z.number().int().min(0).max(6), start: time, end: time })).max(70),
  blackouts: z.array(z.object({ id: z.string().max(100).optional(), startAt: z.iso.datetime(), endAt: z.iso.datetime(), reason: z.string().max(300).default('') })).max(365),
}).superRefine((availability, context) => {
  for (const [index, hours] of availability.hours.entries()) {
    if (hours.end <= hours.start) context.addIssue({ code: 'custom', message: 'Hours must finish after they start.', path: ['hours', index] })
    if (availability.hours.some((other, otherIndex) => otherIndex !== index && hours.weekday === other.weekday && hours.start < other.end && hours.end > other.start)) context.addIssue({ code: 'custom', message: 'Weekly hours cannot overlap.', path: ['hours', index] })
  }
  for (const [index, blackout] of availability.blackouts.entries()) if (blackout.endAt <= blackout.startAt) context.addIssue({ code: 'custom', message: 'A blackout must finish after it starts.', path: ['blackouts', index] })
})
export const guestBookingSchema = z.object({
  serviceId: z.string().uuid(), startAt: z.iso.datetime(), name: z.string().trim().min(2).max(120), email: z.email().max(254).toLowerCase(),
  phone: z.string().trim().max(30).default(''), notes: z.string().trim().max(2000).default(''),
  timezone: z.string().max(100).refine(value => { try { new Intl.DateTimeFormat('en', { timeZone: value }); return true } catch { return false } }).default('Africa/Lagos'),
  consent: z.literal(true), idempotencyKey: z.string().uuid(),
})

const audit = (tx: BookingClient, userId: string | null, action: string, targetId?: string | null, details: Record<string, unknown> = {}) => tx.audit_log.create({ data: { id: randomUUID(), user_id: userId, action, target_id: targetId ?? null, details: JSON.stringify(details), created_at: new Date().toISOString() } })
async function lockBookingCalendar(tx: Prisma.TransactionClient) {
  if (process.env.DATABASE_URL?.startsWith('file:')) {
    await tx.booking_configuration.upsert({ where: { id: 1 }, create: { id: 1 }, update: {} })
    await tx.$executeRaw`UPDATE booking_configuration SET id=id WHERE id=1`
    return
  }
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(4478795, 1)::text AS lock`
}

export async function saveService(input: unknown, userId: string, id: string = randomUUID()): Promise<BookingService> {
  const result = serviceSchema.safeParse(input)
  if (!result.success) throw new BookingError(result.error.issues[0]?.message || 'Please check the service details.')
  const data = result.data
  await db.$transaction(async tx => {
    await lockBookingCalendar(tx)
    await tx.booking_services.upsert({ where: { id }, create: { id, name: data.name, description: data.description, duration_minutes: data.durationMinutes, buffer_minutes: data.bufferMinutes, price_ngn: data.priceNGN, deposit_ngn: data.depositNGN, active: Number(data.active) }, update: { name: data.name, description: data.description, duration_minutes: data.durationMinutes, buffer_minutes: data.bufferMinutes, price_ngn: data.priceNGN, deposit_ngn: data.depositNGN, active: Number(data.active) } })
    await audit(tx, userId, 'booking.service.saved', id)
  })
  return { id, ...data }
}
export async function saveAvailability(input: unknown, userId: string): Promise<Availability> {
  const result = availabilitySchema.safeParse(input)
  if (!result.success) throw new BookingError(result.error.issues[0]?.message || 'Please check your availability.')
  const data = result.data
  await db.$transaction(async tx => {
    await lockBookingCalendar(tx)
    await tx.booking_configuration.upsert({ where: { id: 1 }, create: { id: 1, min_notice_hours: data.minNoticeHours, window_days: data.windowDays, cancellation_notice_hours: data.cancellationNoticeHours, cancellation_policy: data.cancellationPolicy }, update: { min_notice_hours: data.minNoticeHours, window_days: data.windowDays, cancellation_notice_hours: data.cancellationNoticeHours, cancellation_policy: data.cancellationPolicy } })
    await tx.booking_hours.deleteMany()
    await tx.booking_blackouts.deleteMany()
    if (data.hours.length) await tx.booking_hours.createMany({ data: data.hours.map(hour => ({ weekday: hour.weekday, start: hour.start, end: hour.end })) })
    if (data.blackouts.length) await tx.booking_blackouts.createMany({ data: data.blackouts.map(blackout => ({ id: blackout.id || randomUUID(), start_at: blackout.startAt, end_at: blackout.endAt, reason: blackout.reason })) })
    await audit(tx, userId, 'booking.availability.saved', 'availability')
  })
  return getAvailability()
}

export async function createBooking(input: unknown, siteOrigin: string, adminUserId?: string): Promise<{ booking: Booking; token: string; duplicate: boolean }> {
  const parsed = guestBookingSchema.safeParse(input)
  if (!parsed.success) throw new BookingError(parsed.error.issues[0]?.message || 'Please check your booking details.')
  const data = parsed.data
  const requestHash = tokenHash(JSON.stringify(data))
  const token = randomBytes(32).toString('base64url')
  const id = randomUUID()
  const now = new Date().toISOString()
  const result = await runBookingTransaction(async tx => {
    await lockBookingCalendar(tx)
    await tx.booking_configuration.upsert({ where: { id: 1 }, create: { id: 1 }, update: {} })
    const existing = await tx.bookings.findUnique({ where: { idempotency_key: data.idempotencyKey } })
    if (existing) {
      if (existing.request_hash !== requestHash) throw new BookingError('This request has changed. Please start a new booking.', 409)
      return { row: existing, duplicate: true }
    }
    const serviceRow = await tx.booking_services.findFirst({ where: { id: data.serviceId, active: 1, price_ngn: { not: null } } })
    if (!serviceRow || serviceRow.price_ngn === null) throw new BookingError('This service is not currently available.', 404)
    const service = mapService(serviceRow)
    const [config, hours, blackouts, occupied] = await Promise.all([
      tx.booking_configuration.upsert({ where: { id: 1 }, create: { id: 1 }, update: {} }),
      tx.booking_hours.findMany({ orderBy: [{ weekday: 'asc' }, { start: 'asc' }] }),
      tx.booking_blackouts.findMany({ orderBy: { start_at: 'asc' } }),
      tx.bookings.findMany({ where: { OR: [{ status: 'confirmed' }, { status: 'payment_pending', hold_expires_at: { gt: now } }] }, select: { start_at: true, occupied_until: true } }),
    ])
    const availability: Availability = { timezone: 'Africa/Lagos', minNoticeHours: config.min_notice_hours, windowDays: config.window_days, cancellationNoticeHours: config.cancellation_notice_hours, cancellationPolicy: config.cancellation_policy, hours: hours.map(row => ({ weekday: row.weekday, start: row.start, end: row.end })), blackouts: blackouts.map(row => ({ id: row.id, startAt: row.start_at, endAt: row.end_at, reason: row.reason })) }
    const occupiedPeriods = occupied.map(row => ({ startAt: row.start_at, endAt: row.occupied_until }))
    const date = localDate(new Date(data.startAt))
    if (!generateSlots(date, service, availability, occupiedPeriods).some(slot => slot.startAt === data.startAt)) throw new BookingError('That time is no longer available. Please choose another slot.', 409)
    const due = adminUserId ? 0 : service.depositNGN || 0
    const end = new Date(Date.parse(data.startAt) + service.durationMinutes * 60_000).toISOString()
    const occupiedUntil = new Date(Date.parse(end) + service.bufferMinutes * 60_000).toISOString()
    const row = await tx.bookings.create({ data: { id, service_id: service.id, service_name: service.name, name: data.name, email: data.email, phone: data.phone, notes: data.notes, timezone: data.timezone, start_at: data.startAt, end_at: end, occupied_until: occupiedUntil, status: due > 0 ? 'payment_pending' : 'confirmed', payment_status: 'unpaid', price_ngn: service.priceNGN!, due_ngn: due, token_hash: tokenHash(token), hold_expires_at: due > 0 ? new Date(Date.now() + 15 * 60_000).toISOString() : null, idempotency_key: data.idempotencyKey, request_hash: requestHash, created_at: now, updated_at: now } })
    await queueBookingEmail(id, due > 0 ? 'payment_pending' : 'confirmed', `${siteOrigin}/booking/${token}`, undefined, tx)
    if (adminUserId) await audit(tx, adminUserId, 'booking.manual.created', id)
    return { row, duplicate: false }
  })
  return { booking: mapBooking(result.row as unknown as Record<string, unknown>), token: result.duplicate ? '' : token, duplicate: result.duplicate }
}

const escapeHtml = (text: string) => text.replace(/[&<>"']/g, value => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[value] || value)
export async function queueBookingEmail(id: string, event: string, manageURL?: string, eventKey?: string, client: BookingClient = db) {
  const row = await client.bookings.findUnique({ where: { id } })
  if (!row) return
  const booking = mapBooking(row as unknown as Record<string, unknown>)
  const label = event === 'payment_pending' ? 'Your consultation is awaiting payment' : event === 'confirmed' ? 'Your consultation is confirmed' : event === 'rescheduled' ? 'Your consultation time has changed' : event === 'cancelled' ? 'Your consultation has been cancelled' : event === 'reminder' ? 'Your consultation is coming up' : 'Consultation update'
  const when = new Intl.DateTimeFormat('en-NG', { timeZone: booking.timezone, dateStyle: 'full', timeStyle: 'short' }).format(new Date(booking.startAt))
  const html = `<div style="font-family:sans-serif;color:#1A1A2E"><h2>${label}</h2><p>Hello ${escapeHtml(booking.name)},</p><p>${escapeHtml(booking.serviceName)}: ${escapeHtml(when)} (${escapeHtml(booking.timezone)}).</p>${event === 'payment_pending' ? '<p>Complete your deposit within 15 minutes to secure this time.</p>' : ''}${manageURL ? `<p><a href="${escapeHtml(manageURL)}">View, pay for, cancel, or reschedule your booking</a></p><p>Keep this private link safe.</p>` : '<p>Use the private management link in your original booking email to view your booking.</p>'}${booking.paymentStatus === 'refund_requested' ? '<p>Your refund request will be reviewed by the team. Cancellation does not automatically refund a payment.</p>' : ''}</div>`
  try { await client.booking_outbox.create({ data: { id: randomUUID(), event_key: eventKey || `${id}:${event}:${randomUUID()}`, booking_id: id, email: booking.email, subject: label, html, created_at: new Date().toISOString(), event_type: event, start_at: booking.startAt } }) } catch (error) { if ((error as { code?: string }).code !== 'P2002') throw error }
}

export async function changeBooking(id: string, action: 'cancel' | 'reschedule' | 'complete' | 'no_show' | 'confirm', startAt?: string, userId?: string): Promise<Booking> {
  const result = await runBookingTransaction(async tx => {
    await lockBookingCalendar(tx)
    await tx.booking_configuration.upsert({ where: { id: 1 }, create: { id: 1 }, update: {} })
    const row = await tx.bookings.findUnique({ where: { id } })
    if (!row) throw new BookingError('Booking not found.', 404)
    const booking = mapBooking(row as unknown as Record<string, unknown>)
    if (action === 'cancel' && booking.status === 'cancelled') return booking
    if (!['confirmed', 'payment_pending'].includes(booking.status)) throw new BookingError('This booking can no longer be changed.', 409)
    if (!userId && Date.parse(booking.startAt) <= Date.now()) throw new BookingError('Please contact the team to change a session that has already started.', 409)
    const availability = await getAvailabilityFrom(tx)
    if (!userId && Date.parse(booking.startAt) - Date.now() < availability.cancellationNoticeHours * 3_600_000) throw new BookingError('This appointment is inside the change notice period. Please contact the team for help.', 409)
    const now = new Date().toISOString()
    if (action === 'cancel') {
      await tx.bookings.update({ where: { id }, data: { status: 'cancelled', payment_status: booking.paymentStatus === 'paid' ? 'refund_requested' : booking.paymentStatus, updated_at: now } })
      await queueBookingEmail(id, 'cancelled', undefined, undefined, tx)
    } else if (action === 'reschedule') {
      if (!startAt || !z.iso.datetime().safeParse(startAt).success) throw new BookingError('Choose a valid new time.')
      if (startAt === booking.startAt) return booking
      if (booking.status === 'payment_pending' && (!booking.holdExpiresAt || booking.holdExpiresAt <= now)) throw new BookingError('Your payment hold expired. Please start a new booking.', 409)
      const serviceRow = await tx.booking_services.findFirst({ where: { id: booking.serviceId, active: 1, price_ngn: { not: null } } })
      if (!serviceRow) throw new BookingError('Please contact the team to reschedule this service.', 409)
      const service = mapService(serviceRow)
      const duration = Date.parse(booking.endAt) - Date.parse(booking.startAt)
      const buffer = Date.parse(row.occupied_until) - Date.parse(booking.endAt)
      const originalService = { ...service, durationMinutes: duration / 60_000, bufferMinutes: buffer / 60_000 }
      const occupied = await getOccupiedFrom(tx, id)
      if (!generateSlots(localDate(new Date(startAt)), originalService, availability, occupied).some(slot => slot.startAt === startAt)) throw new BookingError('That time is unavailable. Please choose another slot.', 409)
      const endAt = new Date(Date.parse(startAt) + duration).toISOString()
      const occupiedUntil = new Date(Date.parse(endAt) + buffer).toISOString()
      if (occupied.some(period => Date.parse(startAt) < Date.parse(period.endAt) && Date.parse(occupiedUntil) > Date.parse(period.startAt)) || availability.blackouts.some(period => Date.parse(startAt) < Date.parse(period.endAt) && Date.parse(occupiedUntil) > Date.parse(period.startAt))) throw new BookingError('That time cannot fit your original appointment length.', 409)
      await tx.bookings.update({ where: { id }, data: { start_at: startAt, end_at: endAt, occupied_until: occupiedUntil, updated_at: now } })
      await queueBookingEmail(id, 'rescheduled', undefined, undefined, tx)
    } else {
      if (!userId) throw new BookingError('This action requires administrator access.', 403)
      if (action === 'confirm' && booking.dueNGN > booking.paidNGN) throw new BookingError('A required deposit has not been verified. Payment confirmation must come from Paystack.', 409)
      if ((action === 'complete' || action === 'no_show') && Date.parse(booking.startAt) > Date.now()) throw new BookingError('A future appointment cannot be marked completed or missed.')
      await tx.bookings.update({ where: { id }, data: { status: action === 'complete' ? 'completed' : action === 'no_show' ? 'no_show' : 'confirmed', updated_at: now } })
    }
    if (userId) await audit(tx, userId, `booking.${action}`, id)
    const updated = await tx.bookings.findUnique({ where: { id } })
    return mapBooking(updated as unknown as Record<string, unknown>)
  })
  return result
}

async function getAvailabilityFrom(client: BookingClient): Promise<Availability> {
  const config = await client.booking_configuration.upsert({ where: { id: 1 }, create: { id: 1 }, update: {} })
  const [hours, blackouts] = await Promise.all([client.booking_hours.findMany({ orderBy: [{ weekday: 'asc' }, { start: 'asc' }] }), client.booking_blackouts.findMany({ orderBy: { start_at: 'asc' } })])
  return { timezone: 'Africa/Lagos', minNoticeHours: config.min_notice_hours, windowDays: config.window_days, cancellationNoticeHours: config.cancellation_notice_hours, cancellationPolicy: config.cancellation_policy, hours: hours.map(row => ({ weekday: row.weekday, start: row.start, end: row.end })), blackouts: blackouts.map(row => ({ id: row.id, startAt: row.start_at, endAt: row.end_at, reason: row.reason })) }
}
async function getOccupiedFrom(client: BookingClient, excludeId = ''): Promise<OccupiedPeriod[]> {
  const now = new Date().toISOString()
  const rows = await client.bookings.findMany({ where: { id: { not: excludeId }, OR: [{ status: 'confirmed' }, { status: 'payment_pending', hold_expires_at: { gt: now } }] }, select: { start_at: true, occupied_until: true } })
  return rows.map(row => ({ startAt: row.start_at, endAt: row.occupied_until }))
}
