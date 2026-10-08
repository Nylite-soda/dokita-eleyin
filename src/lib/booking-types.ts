export type BookingStatus = 'confirmed' | 'payment_pending' | 'cancelled' | 'completed' | 'no_show'
export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'refund_requested' | 'refund_pending' | 'refunded'
export interface BookingService {
  id: string
  name: string
  description: string
  durationMinutes: number
  bufferMinutes: number
  priceNGN: number | null
  depositNGN: number | null
  active: boolean
}
export interface Availability {
  timezone: 'Africa/Lagos'
  minNoticeHours: number
  windowDays: number
  cancellationNoticeHours: number
  cancellationPolicy: string
  hours: { weekday: number; start: string; end: string }[]
  blackouts: { id: string; startAt: string; endAt: string; reason: string }[]
}
export interface Booking {
  id: string
  serviceId: string
  serviceName: string
  name: string
  email: string
  phone: string
  notes: string
  timezone: string
  startAt: string
  endAt: string
  status: BookingStatus
  paymentStatus: PaymentStatus
  priceNGN: number
  dueNGN: number
  paidNGN: number
  createdAt: string
  holdExpiresAt: string | null
}
export interface BookingSlot { startAt: string; endAt: string }
export interface OccupiedPeriod { startAt: string; endAt: string }
