import { redirect } from 'next/navigation'
import { getCurrentUser, requireAdmin } from '@/lib/auth'
import { getServices, paymentConfigured } from '@/lib/booking'
import ServicesManager from '@/components/admin/ServicesManager'

export default async function ServicesPage() {
  const user = await getCurrentUser()
  if (user?.role !== 'admin') redirect('/admin')
  await requireAdmin()
  const services = await getServices(true)
  return <div><h1 className="text-3xl font-display text-brand-navy mb-2">Consultation services</h1><p className="text-ink-muted mb-6">Configure appointments, prices, deposits, and availability.</p><ServicesManager initialServices={services} paymentConfigured={await paymentConfigured()} /></div>
}
