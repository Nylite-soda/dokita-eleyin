import DentalMotion from '@/components/ui/DentalMotion'

export default function AdminLoading() {
  return <div className="admin-main flex min-h-[65vh] flex-col items-center justify-center text-center" aria-busy="true">
    <DentalMotion size="lg" label="Loading the practice dashboard" />
    <div className="mt-8 w-full max-w-3xl" aria-hidden="true">
      <div className="loading-skeleton-block mb-5 h-8 w-56 rounded-lg" />
      <div className="grid gap-4 sm:grid-cols-3"><div className="loading-skeleton-block h-28 rounded-2xl" /><div className="loading-skeleton-block h-28 rounded-2xl" /><div className="loading-skeleton-block h-28 rounded-2xl" /></div>
    </div>
  </div>
}
