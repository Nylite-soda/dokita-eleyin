import assert from 'node:assert/strict'
import { after, beforeEach, test } from 'node:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { createHmac, randomUUID } from 'node:crypto'
import { fork } from 'node:child_process'
import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

// Each test-file process owns a disposable DB; production data and providers are never used.
const temporary = mkdtempSync(join(tmpdir(), 'dokita-booking-tests-'))
process.env.DATABASE_PATH = join(temporary, 'booking.sqlite')
process.env.DATABASE_URL = `file:${process.env.DATABASE_PATH}`
process.env.DOKITA_SQLITE_TEST = '1'
process.env.NEXT_PUBLIC_SITE_URL = 'https://example.test'
process.env.PAYSTACK_SECRET_KEY = ''
process.env.ZEPTOMAIL_API_KEY = ''
process.env.ZEPTOMAIL_FROM_EMAIL = ''
globalThis.fetch = async () => { throw new Error('Network access is forbidden in booking unit tests.') }

execFileSync(process.execPath, [resolve('node_modules/prisma/build/index.js'), 'db', 'push', '--config', 'prisma.sqlite.config.ts'], { env: process.env, stdio: 'pipe' })

const { getPrisma } = await import('../src/lib/prisma.ts')
const { BookingError, createBooking, changeBooking, getAvailability, getBookingRow, getBookings, getManagedBooking, getSlots, saveAvailability, saveService, tokenHash } = await import('../src/lib/booking.ts')
const { acceptVerifiedCharge, initializeBookingPayment, processPaystackEvent, refundBookingPayment, validPaystackSignature } = await import('../src/lib/booking-payments.ts')
const { generateSlots, localDate, wallTimeToUTC } = await import('../src/lib/booking-slots.ts')

const db = getPrisma()
const administrator = randomUUID()
const now = new Date().toISOString()
await db.users.create({ data: { id: administrator, email: 'administrator@example.test', name: 'Test administrator', password_hash: 'unused-test-fixture', role: 'admin', created_at: now, updated_at: now } })

const standardAvailability = () => ({ timezone: 'Africa/Lagos', minNoticeHours: 0, windowDays: 90, cancellationNoticeHours: 0, cancellationPolicy: '', hours: Array.from({ length: 7 }, (_, weekday) => ({ weekday, start: '08:00', end: '20:00' })), blackouts: [] })
async function service(overrides = {}) { return saveService({ name: 'Test consultation', description: 'Test fixture only', durationMinutes: 30, bufferMinutes: 15, priceNGN: 12000, depositNGN: null, active: true, ...overrides }, administrator) }
function futureDate(days = 7) { return localDate(new Date(Date.now() + days * 86400000)) }
function start(date = futureDate(), clock = '10:00') { return wallTimeToUTC(date, clock).toISOString() }
function input(selectedService, startAt = start(), overrides = {}) { return { serviceId: selectedService.id, startAt, name: 'Test client', email: 'client@example.test', phone: '', notes: '', timezone: 'Africa/Lagos', consent: true, idempotencyKey: randomUUID(), ...overrides } }
async function reserve(selectedService, startAt = start(), overrides = {}) { return createBooking(input(selectedService, startAt, overrides), 'https://example.test') }
async function expectBookingError(callback, status) { await assert.rejects(typeof callback === 'function' ? callback() : callback, error => error instanceof BookingError && error.status === status) }
async function setPending(result, { expired = false, amount = 3000, reference = `test-${randomUUID()}` } = {}) {
  await db.bookings.update({ where: { id: result.booking.id }, data: { status: 'payment_pending', payment_status: 'pending', due_ngn: amount, payment_reference: reference, hold_expires_at: new Date(Date.now() + (expired ? -60000 : 900000)).toISOString() } })
  return { reference, status: 'success', amount: amount * 100, currency: 'NGN', customer: { email: result.booking.email } }
}
async function outboxCount() { return db.booking_outbox.count() }
async function mockPayments(callback, mockFetch = globalThis.fetch) {
  const originalFetch = globalThis.fetch
  process.env.PAYSTACK_SECRET_KEY = 'inert-local-test-value'
  globalThis.fetch = mockFetch
  try { return await callback() }
  finally { process.env.PAYSTACK_SECRET_KEY = ''; globalThis.fetch = originalFetch }
}

beforeEach(async () => {
  await db.booking_outbox.deleteMany()
  await db.booking_payment_events.deleteMany()
  await db.bookings.deleteMany()
  await db.booking_services.deleteMany()
  await db.booking_blackouts.deleteMany()
  await db.booking_hours.deleteMany()
  await saveAvailability(standardAvailability(), administrator)
})
after(async () => {
  await db.$disconnect()
  // Only delete this suite's freshly created directory directly under the OS temp root.
  assert.equal(dirname(resolve(temporary)), resolve(tmpdir()))
  assert.ok(basename(temporary).startsWith('dokita-booking-tests-'))
  rmSync(temporary, { recursive: true, force: true })
})

test('booking transaction rejects collisions without persisting a booking or notification', async () => {
  const selected = await service()
  const first = await reserve(selected)
  await expectBookingError(() => reserve(selected), 409)
  assert.equal((await getBookings()).length, 1)
  assert.equal(await outboxCount(), 1)
  assert.equal((await getBookingRow(first.booking.id)).token_hash, tokenHash(first.token))
  assert.equal((await getBookingRow(first.booking.id)).token, undefined)
  assert.equal((await getManagedBooking(first.token)).id, first.booking.id)
  await expectBookingError(() => getManagedBooking('wrong-token'), 404)
  // A subsequent transaction succeeds: the collision did not leave SQLite in a transaction.
  await reserve(selected, start(futureDate(), '12:00'))
  assert.equal((await getBookings()).length, 2)
})

test('idempotency retries return one booking and no management token; changed requests fail', async () => {
  const selected = await service()
  const request = input(selected)
  const first = await createBooking(request, 'https://example.test')
  const retry = await createBooking(request, 'https://example.test')
  assert.equal(retry.booking.id, first.booking.id)
  assert.equal(retry.duplicate, true)
  assert.equal(retry.token, '')
  assert.equal((await getBookings()).length, 1)
  assert.equal(await outboxCount(), 1)
  await expectBookingError(() => createBooking({ ...request, email: 'another@example.test' }, 'https://example.test'), 409)
  assert.equal((await getBookings()).length, 1)
})

test('buffer time blocks overlapping starts and permits appointments at the exact occupied boundary', async () => {
  const selected = await service()
  await reserve(selected, start(futureDate(), '10:00'))
  const slots = (await getSlots(selected.id, futureDate())).map(slot => slot.startAt)
  assert.equal(slots.includes(start(futureDate(), '10:30')), false)
  assert.equal(slots.includes(start(futureDate(), '10:45')), true)
  await expectBookingError(() => reserve(selected, start(futureDate(), '10:30')), 409)
  await reserve(selected, start(futureDate(), '10:45'))
  assert.equal((await getBookings()).length, 2)
})

test('slot generation uses Lagos day boundaries, rejects impossible dates, and fits duration plus buffer before closing', async () => {
  const selected = await service()
  assert.equal(localDate(new Date('2028-06-04T23:30:00Z')), '2028-06-05')
  assert.equal(wallTimeToUTC('2028-06-05', '00:30').toISOString(), '2028-06-04T23:30:00.000Z')
  const availability = { ...standardAvailability(), hours: [{ weekday: 1, start: '09:00', end: '10:00' }] }
  const slots = generateSlots('2028-06-05', selected, availability, [], new Date('2028-06-04T00:00:00Z'))
  assert.deepEqual(slots.map(slot => slot.startAt), ['2028-06-05T08:00:00.000Z', '2028-06-05T08:15:00.000Z'])
  assert.deepEqual(generateSlots('2028-02-30', selected, availability, [], new Date('2028-02-01T00:00:00Z')), [])
})

test('minimum notice, booking horizon, blackouts, and buffers determine offered slots', async () => {
  const selected = await service()
  const availability = { ...standardAvailability(), minNoticeHours: 2, windowDays: 2, blackouts: [{ id: 'test-blackout', startAt: '2028-06-05T10:00:00.000Z', endAt: '2028-06-05T11:00:00.000Z', reason: 'Test' }] }
  const slots = generateSlots('2028-06-05', selected, availability, [], new Date('2028-06-05T07:00:00Z')).map(slot => slot.startAt)
  assert.equal(slots.includes('2028-06-05T08:45:00.000Z'), false)
  assert.equal(slots.includes('2028-06-05T09:00:00.000Z'), true)
  assert.equal(slots.includes('2028-06-05T09:30:00.000Z'), false)
  assert.equal(slots.includes('2028-06-05T10:45:00.000Z'), false)
  assert.equal(slots.includes('2028-06-05T11:00:00.000Z'), true)
  assert.deepEqual(generateSlots('2028-06-08', selected, availability, [], new Date('2028-06-05T07:00:00Z')), [])
})

test('availability validation rolls back duplicate blackout keys without deleting existing working hours', async () => {
  const original = await getAvailability()
  const blackout = { id: 'duplicate', startAt: start(), endAt: start(futureDate(), '11:00'), reason: 'Test fixture' }
  await assert.rejects(saveAvailability({ ...original, hours: [{ weekday: 1, start: '12:00', end: '14:00' }], blackouts: [blackout, blackout] }, administrator))
  assert.deepEqual(await getAvailability(), original)
  assert.ok((await getSlots((await service()).id, futureDate())).length > 0)
})

test('rescheduling preserves the booked price, original duration, and original buffer after service edits', async () => {
  const selected = await service()
  const original = await reserve(selected)
  await saveService({ ...selected, name: 'Edited service', durationMinutes: 60, bufferMinutes: 30, priceNGN: 50000 }, administrator, selected.id)
  const updated = await changeBooking(original.booking.id, 'reschedule', start(futureDate(), '13:00'))
  assert.equal(updated.serviceName, original.booking.serviceName)
  assert.equal(updated.priceNGN, original.booking.priceNGN)
  assert.equal(Date.parse(updated.endAt) - Date.parse(updated.startAt), 30 * 60000)
  assert.equal(Date.parse((await getBookingRow(updated.id)).occupied_until) - Date.parse(updated.endAt), 15 * 60000)
})

test('rescheduling into another booking fails atomically and cancelling frees the occupied period', async () => {
  const selected = await service()
  const first = await reserve(selected)
  const second = await reserve(selected, start(futureDate(), '12:00'))
  await expectBookingError(() => changeBooking(first.booking.id, 'reschedule', second.booking.startAt), 409)
  assert.equal((await getBookingRow(first.booking.id)).start_at, first.booking.startAt)
  assert.equal(await outboxCount(), 2)
  const cancelled = await changeBooking(second.booking.id, 'cancel')
  assert.equal(cancelled.status, 'cancelled')
  assert.equal((await getSlots(selected.id, futureDate())).some(slot => slot.startAt === second.booking.startAt), true)
  const updated = await changeBooking(first.booking.id, 'reschedule', second.booking.startAt)
  assert.equal(updated.startAt, second.booking.startAt)
  const beforeRetry = await outboxCount()
  await changeBooking(second.booking.id, 'cancel')
  assert.equal(await outboxCount(), beforeRetry)
})

test('guest cancellation notice is enforced while administrators can intervene', async () => {
  const selected = await service()
  const first = await reserve(selected, start(futureDate(1)))
  await saveAvailability({ ...standardAvailability(), cancellationNoticeHours: 48 }, administrator)
  await expectBookingError(() => changeBooking(first.booking.id, 'cancel'), 409)
  await expectBookingError(() => changeBooking(first.booking.id, 'complete'), 409)
  const cancelled = await changeBooking(first.booking.id, 'cancel', undefined, administrator)
  assert.equal(cancelled.status, 'cancelled')
})

test('admin confirmation cannot bypass an unpaid deposit and future appointments cannot be marked attended', async () => {
  const selected = await service()
  const first = await reserve(selected)
  await setPending(first)
  await expectBookingError(() => changeBooking(first.booking.id, 'confirm', undefined, administrator), 409)
  await expectBookingError(() => changeBooking(first.booking.id, 'complete', undefined, administrator), 400)
  await expectBookingError(() => changeBooking(first.booking.id, 'no_show', undefined, administrator), 400)
  assert.equal((await getBookingRow(first.booking.id)).status, 'payment_pending')
})

test('verified charges require matching amount, currency, and customer; replay does not duplicate notification', async () => {
  const selected = await service()
  const first = await reserve(selected)
  const charge = await setPending(first)
  await expectBookingError(() => acceptVerifiedCharge({ ...charge, amount: charge.amount - 1 }), 409)
  await expectBookingError(() => acceptVerifiedCharge({ ...charge, currency: 'USD' }), 409)
  await expectBookingError(() => acceptVerifiedCharge({ ...charge, customer: { email: 'someone-else@example.test' } }), 409)
  assert.equal((await getBookingRow(first.booking.id)).paid_ngn, 0)
  assert.equal(await outboxCount(), 1)
  const accepted = await acceptVerifiedCharge(charge)
  assert.equal(accepted.status, 'confirmed')
  assert.equal(accepted.paidNGN, 3000)
  assert.equal(accepted.paymentStatus, 'paid')
  assert.equal(await outboxCount(), 2)
  assert.equal((await acceptVerifiedCharge(charge)).id, accepted.id)
  assert.equal(await outboxCount(), 2)
})

test('expired payment holds free slots; late payment cannot displace a newer reservation', async () => {
  const selected = await service()
  const first = await reserve(selected)
  const charge = await setPending(first, { expired: true })
  assert.equal((await getSlots(selected.id, futureDate())).some(slot => slot.startAt === first.booking.startAt), true)
  const replacement = await reserve(selected)
  const accepted = await acceptVerifiedCharge(charge)
  assert.equal(accepted.status, 'cancelled')
  assert.equal(accepted.paymentStatus, 'refund_requested')
  assert.equal(accepted.paidNGN, 3000)
  assert.equal((await getBookingRow(replacement.booking.id)).status, 'confirmed')
  assert.equal((await getBookings()).filter(booking => booking.status === 'confirmed').length, 1)
})

test('expired holds cannot be paid or rescheduled and refunded cancellation cannot be reconfirmed', async () => {
  const selected = await service()
  const first = await reserve(selected)
  const charge = await setPending(first, { expired: true })
  await mockPayments(() => assert.rejects(initializeBookingPayment(first.token, 'https://example.test'), error => error instanceof BookingError && error.status === 409))
  await expectBookingError(() => changeBooking(first.booking.id, 'reschedule', start(futureDate(), '14:00')), 409)
  await changeBooking(first.booking.id, 'cancel')
  assert.equal((await acceptVerifiedCharge(charge)).paymentStatus, 'refund_requested')
  await expectBookingError(() => changeBooking(first.booking.id, 'confirm', undefined, administrator), 409)
})

test('refunds require a cancelled verified payment and never call a provider for unpaid bookings', async () => {
  const selected = await service()
  const first = await reserve(selected)
  await assert.rejects(refundBookingPayment(first.booking.id, administrator), error => error instanceof BookingError && error.status === 409)
  await changeBooking(first.booking.id, 'cancel')
  await assert.rejects(refundBookingPayment(first.booking.id, administrator), error => error instanceof BookingError && error.status === 409)
  assert.equal((await getBookingRow(first.booking.id)).payment_status, 'unpaid')
  assert.equal(validPaystackSignature('{}', '0'.repeat(128)), false)
})

test('payment webhook signatures authenticate the exact body and reject tampering or malformed signatures', async () => {
  await mockPayments(async () => {
    const payload = JSON.stringify({ event: 'charge.success', data: { reference: 'test-reference' } })
    const signature = createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(payload).digest('hex')
    assert.equal(validPaystackSignature(payload, signature), true)
    assert.equal(validPaystackSignature(`${payload} `, signature), false)
    assert.equal(validPaystackSignature(payload, null), false)
    assert.equal(validPaystackSignature(payload, 'not-a-signature'), false)
    assert.equal(validPaystackSignature(payload, 'f'.repeat(128)), false)
  })
})

test('booking email escapes user content and tokens are hashed on booking rows', async () => {
  const selected = await service({ name: 'Test <script>alert(1)</script> service' })
  const first = await reserve(selected, start(), { name: '<img src=x onerror=alert(1)>', notes: '<script>private note</script>' })
  const message = (await db.booking_outbox.findFirst({ where: { booking_id: first.booking.id } })).html
  assert.equal(message.includes('<img src=x'), false)
  assert.equal(message.includes('<script>'), false)
  assert.equal(message.includes('&lt;img'), true)
  assert.equal(message.includes('&lt;script&gt;'), true)
  assert.equal(message.includes('private note'), false)
  assert.equal(message.includes(`/booking/${first.token}`), true)
  assert.equal(JSON.stringify(first.booking).includes(first.token), false)
})

test('checkout initialization preserves its reference after a timeout and reuses a persisted checkout', async () => {
  const selected = await service()
  const first = await reserve(selected)
  await setPending(first)
  // Start initialization rather than reuse the reference inserted for verified-charge fixtures.
  await db.bookings.update({ where: { id: first.booking.id }, data: { payment_reference: null } })
  let attemptedReference
  let calls = 0
  await mockPayments(async () => {
    await assert.rejects(initializeBookingPayment(first.token, 'https://example.test'), error => error instanceof BookingError && error.status === 502)
    assert.equal((await getBookingRow(first.booking.id)).payment_reference, attemptedReference)
    assert.equal((await getBookingRow(first.booking.id)).payment_status, 'pending')
    await db.bookings.update({ where: { id: first.booking.id }, data: { payment_init_started_at: new Date(Date.now() - 31000).toISOString() } })
    const checkout = await initializeBookingPayment(first.token, 'https://example.test')
    assert.equal(checkout, 'https://checkout.paystack.com/test-checkout')
    assert.equal((await getBookingRow(first.booking.id)).payment_reference, attemptedReference)
    assert.equal(await initializeBookingPayment(first.token, 'https://example.test'), checkout)
    assert.equal(calls, 2)
  }, async (url, options) => {
    assert.equal(String(url), 'https://api.paystack.co/transaction/initialize')
    const body = JSON.parse(options.body)
    assert.equal(body.amount, 300000)
    assert.equal(body.currency, 'NGN')
    assert.equal(body.email, 'client@example.test')
    assert.equal(body.callback_url, `https://example.test/booking/${first.token}?payment=return`)
    calls++
    if (calls === 1) { attemptedReference = body.reference; throw new Error('Simulated network timeout') }
    assert.equal(body.reference, attemptedReference)
    return Response.json({ status: true, data: { authorization_url: 'https://checkout.paystack.com/test-checkout', reference: body.reference } })
  })
})

test('a checkout worker cannot return a chargeable URL after another action cancels its hold', async () => {
  const selected = await service()
  const first = await reserve(selected)
  await setPending(first)
  await db.bookings.update({ where: { id: first.booking.id }, data: { payment_reference: null } })
  let respond, reference, calls = 0
  await mockPayments(async () => {
    const preparing = initializeBookingPayment(first.token, 'https://example.test')
    await assert.rejects(initializeBookingPayment(first.token, 'https://example.test'), error => error instanceof BookingError && error.status === 409)
    await changeBooking(first.booking.id, 'cancel')
    respond(Response.json({ status: true, data: { authorization_url: 'https://checkout.paystack.com/test-suspended', reference } }))
    await assert.rejects(preparing, error => error instanceof BookingError && error.status === 409)
    assert.equal(calls, 1)
    assert.equal((await getBookingRow(first.booking.id)).payment_url, null)
    assert.equal((await getBookingRow(first.booking.id)).payment_reference, reference)
  }, async (_url, options) => {
    calls++; reference = JSON.parse(options.body).reference
    return new Promise(resolveResponse => { respond = resolveResponse })
  })
})

test('a provider 5xx refund outcome remains pending and a repeated request sends no second refund', async () => {
  const selected = await service()
  const first = await reserve(selected)
  const charge = await setPending(first)
  await acceptVerifiedCharge(charge)
  await changeBooking(first.booking.id, 'cancel')
  let calls = 0
  await mockPayments(async () => {
    await assert.rejects(refundBookingPayment(first.booking.id, administrator), error => error instanceof BookingError && error.status === 502)
    assert.equal((await getBookingRow(first.booking.id)).payment_status, 'refund_pending')
    assert.equal((await refundBookingPayment(first.booking.id, administrator)).paymentStatus, 'refund_pending')
    assert.equal(calls, 1)
  }, async (url, options) => {
    calls++
    assert.equal(String(url), 'https://api.paystack.co/refund')
    const body = JSON.parse(options.body)
    assert.equal(body.amount, charge.amount)
    assert.equal(body.transaction, charge.reference)
    return new Response('{}', { status: 503 })
  })
})

test('a refund webhook arriving before the initialization response stays refunded and is correlated by transaction', async () => {
  const selected = await service()
  const first = await reserve(selected)
  const charge = await setPending(first)
  await acceptVerifiedCharge(charge)
  await changeBooking(first.booking.id, 'cancel')
  let calls = 0
  await mockPayments(async () => {
    const result = await refundBookingPayment(first.booking.id, administrator)
    assert.equal(result.paymentStatus, 'refunded')
    assert.equal((await getBookingRow(first.booking.id)).refund_id, '98765')
    assert.equal((await refundBookingPayment(first.booking.id, administrator)).paymentStatus, 'refunded')
    assert.equal(calls, 1)
  }, async () => {
    calls++
    // This represents an authenticated/signed webhook already admitted by the route.
    await processPaystackEvent({ event: 'refund.processed', data: { id: 98765, amount: charge.amount, currency: 'NGN', transaction: { reference: charge.reference } } })
    assert.equal((await getBookingRow(first.booking.id)).payment_status, 'refunded')
    return Response.json({ status: true, data: { id: 98765, status: 'pending' } })
  })
})

test('separate SQLite processes competing for the same slot produce exactly one reservation', { timeout: 30000 }, async () => {
  const selected = await service()
  const workerPath = resolve('tests/booking-race-worker.mjs')
  const loaderPath = pathToFileURL(resolve('scripts/test-loader.mjs')).href
  const workers = Array.from({ length: 2 }, () => fork(workerPath, [], { silent: true, execArgv: ['--experimental-loader', loaderPath], env: { ...process.env, RACE_BOOKING_PAYLOAD: JSON.stringify(input(selected)) } }))
  const ready = workers.map(worker => new Promise((resolveReady, reject) => {
    let errors = ''
    worker.stderr.on('data', chunk => { errors += chunk })
    worker.once('error', reject)
    worker.on('message', message => { if (message.ready) resolveReady() })
    worker.once('exit', code => { if (code !== 0) reject(new Error(`Race worker exited ${code}: ${errors}`)) })
  }))
  try {
    await Promise.all(ready)
    const results = workers.map(worker => new Promise((resolveResult, reject) => { worker.once('error', reject); worker.on('message', message => { if ('ok' in message) resolveResult(message) }) }))
    workers.forEach(worker => worker.send('reserve'))
    const outcomes = await Promise.all(results)
    assert.equal(outcomes.length, 2, JSON.stringify(outcomes))
    assert.equal(outcomes.filter(result => result.ok).length, 1, JSON.stringify(outcomes))
    assert.equal(outcomes.filter(result => !result.ok && result.status === 409).length, 1, JSON.stringify(outcomes))
    assert.equal((await getBookings()).length, 1)
    assert.equal(await outboxCount(), 1)
  } finally {
    const exited = workers.map(worker => worker.exitCode === null && worker.signalCode === null ? new Promise(resolveExit => worker.once('exit', resolveExit)) : Promise.resolve())
    workers.forEach(worker => worker.kill())
    await Promise.all(exited)
  }
})
