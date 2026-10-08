import type { Availability, BookingService, BookingSlot, OccupiedPeriod } from './booking-types'

const formatter = (timezone: string) => new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })

export function localDate(instant: Date, timezone = 'Africa/Lagos'): string {
  const parts = new Map(formatter(timezone).formatToParts(instant).map(part => [part.type, part.value]))
  return `${parts.get('year')}-${parts.get('month')}-${parts.get('day')}`
}

/** Convert the clinic wall clock to UTC, including offset changes in IANA zones. */
export function wallTimeToUTC(date: string, time: string, timezone = 'Africa/Lagos'): Date {
  const desired = Date.parse(`${date}T${time}:00Z`)
  if (!Number.isFinite(desired)) throw new Error('Invalid appointment date.')
  let instant = desired
  for (let pass = 0; pass < 3; pass++) {
    const parts = new Map(formatter(timezone).formatToParts(new Date(instant)).map(part => [part.type, part.value]))
    const represented = Date.UTC(Number(parts.get('year')), Number(parts.get('month')) - 1, Number(parts.get('day')), Number(parts.get('hour')), Number(parts.get('minute')), Number(parts.get('second')))
    const difference = desired - represented
    if (difference === 0) return new Date(instant)
    instant += difference
  }
  throw new Error('This local time is unavailable.')
}

export function overlaps(start: number, end: number, period: OccupiedPeriod): boolean {
  return start < Date.parse(period.endAt) && end > Date.parse(period.startAt)
}

export function generateSlots(date: string, service: BookingService, availability: Availability, occupied: OccupiedPeriod[], now = new Date()): BookingSlot[] {
  if (!service.active || service.priceNGN === null || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return []
  const midnight = wallTimeToUTC(date, '00:00', availability.timezone)
  if (localDate(midnight, availability.timezone) !== date) return []
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay()
  const earliest = now.getTime() + availability.minNoticeHours * 3_600_000
  const latest = now.getTime() + availability.windowDays * 86_400_000
  const periods = [...occupied, ...availability.blackouts]
  const slots: BookingSlot[] = []
  const toMinutes = (value: string) => Number(value.slice(0, 2)) * 60 + Number(value.slice(3))
  const clock = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

  for (const hours of availability.hours.filter(item => item.weekday === weekday)) {
    const start = toMinutes(hours.start)
    const finish = toMinutes(hours.end)
    for (let minute = start; minute + service.durationMinutes + service.bufferMinutes <= finish; minute += 15) {
      const instant = wallTimeToUTC(date, clock(minute), availability.timezone).getTime()
      const end = instant + service.durationMinutes * 60_000
      const occupiedEnd = end + service.bufferMinutes * 60_000
      if (instant < earliest || instant > latest || periods.some(period => overlaps(instant, occupiedEnd, period))) continue
      slots.push({ startAt: new Date(instant).toISOString(), endAt: new Date(end).toISOString() })
    }
  }
  return [...new Map(slots.map(slot => [slot.startAt, slot])).values()].sort((a, b) => a.startAt.localeCompare(b.startAt))
}
