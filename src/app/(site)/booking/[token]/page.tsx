import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import BookingManager from '@/components/consultation/BookingManager'
import { BookingError, getAvailability, getManagedBooking, paymentConfigured } from '@/lib/booking'
import type { Booking } from '@/lib/booking-types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const metadata: Metadata = { title: 'Your Consultation Booking', robots: { index: false, follow: false }, alternates: { canonical: '/consultation' } }

export default async function ManageBookingPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ payment?: string }> }) {
  const { token } = await params
  const query = await searchParams
  let booking: Booking
  try {
    booking = await getManagedBooking(token)
  } catch (error) {
    if (error instanceof BookingError && error.status === 404) notFound()
    throw error
  }
  const { windowDays, cancellationNoticeHours, cancellationPolicy } = await getAvailability()
  return <div className="pt-32 pb-20 px-5 sm:px-6"><div className="max-w-3xl mx-auto space-y-8"><header className="space-y-3"><h1 className="text-display-md font-display text-brand-navy">Your consultation</h1><p className="text-ink/80">View your appointment, check a payment, or change your plans.</p></header><BookingManager initialBooking={booking} token={token} availability={{ windowDays, cancellationNoticeHours, cancellationPolicy }} paymentAvailable={paymentConfigured()} paymentReturned={query.payment === 'return'} /></div></div>
}
