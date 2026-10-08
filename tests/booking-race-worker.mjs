import { createBooking } from '../src/lib/booking.ts'

process.send?.({ ready: true })
process.once('message', async () => {
  try {
    const result = await createBooking(JSON.parse(process.env.RACE_BOOKING_PAYLOAD), 'https://example.test')
    process.send?.({ ok: true, id: result.booking.id }, () => process.exit(0))
  } catch (error) {
    process.send?.({ ok: false, status: error.status, message: error.message }, () => process.exit(0))
  }
})
