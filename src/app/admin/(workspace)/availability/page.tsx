import { redirect } from 'next/navigation'
import { getCurrentUser, requireAdmin } from '@/lib/auth'
import { getAvailability } from '@/lib/booking'
import AvailabilityManager from '@/components/admin/AvailabilityManager'

export default async function AvailabilityPage() {
  const user = await getCurrentUser()
  if (user?.role !== 'admin') redirect('/admin')
  await requireAdmin()
  return <div><h1 className="text-3xl font-display text-brand-navy mb-2">Availability</h1><p className="text-ink-muted mb-6">Set recurring hours, booking notice, and unavailable dates.</p><AvailabilityManager initialAvailability={await getAvailability()} /></div>
}
