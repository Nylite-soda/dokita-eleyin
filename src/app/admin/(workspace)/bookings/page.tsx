import { redirect } from 'next/navigation'
import { getCurrentUser, requireAdmin } from '@/lib/auth'
import { getBookings, getServices, paymentConfigured } from '@/lib/booking'
import BookingsManager from '@/components/admin/BookingsManager'

export default async function BookingsPage() {
  const user = await getCurrentUser()
  if (user?.role !== 'admin') redirect('/admin')
  await requireAdmin()
  const [bookings, services] = await Promise.all([getBookings(), getServices(true)])
  return <div><h1 className="text-3xl font-display text-brand-navy mb-2">Bookings</h1><p className="text-ink-muted mb-6">Manage appointments, client details, payment status, and refunds.</p><BookingsManager initialBookings={bookings} services={services} paymentConfigured={await paymentConfigured()} /></div>
}
