import type { Booking } from './booking-types'

const escape = (value: string) => value.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,')
const instant = (value: string) => new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

/** Calendar files contain appointment timing, not private notes or management tokens. */
export function bookingCalendar(booking: Booking): string {
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Dokita Eleyin//Consultations//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT', `UID:${booking.id}@dokita-eleyin`, `DTSTAMP:${instant(booking.createdAt)}`, `DTSTART:${instant(booking.startAt)}`, `DTEND:${instant(booking.endAt)}`, `SUMMARY:${escape(booking.serviceName)}`, 'DESCRIPTION:Consultation appointment. Keep your private booking link to manage this appointment.', `STATUS:${booking.status === 'cancelled' ? 'CANCELLED' : booking.status === 'payment_pending' ? 'TENTATIVE' : 'CONFIRMED'}`, 'END:VEVENT', 'END:VCALENDAR', ''].join('\r\n')
}
