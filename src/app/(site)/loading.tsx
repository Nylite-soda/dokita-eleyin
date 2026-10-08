import DentalMotion from '@/components/ui/DentalMotion'

export default function Loading() {
  return <div className="mx-auto flex min-h-[65vh] w-full max-w-6xl flex-col items-center justify-center px-6 py-24" aria-busy="true">
    <DentalMotion size="lg" label="Loading page content from the clinic library" />
    <div className="mt-10 w-full max-w-2xl animate-pulse" aria-hidden="true">
      <div className="mx-auto mb-5 h-4 w-28 rounded-full bg-surface-card" />
      <div className="mx-auto mb-5 h-10 w-4/5 rounded-xl bg-surface-card" />
      <div className="mx-auto mb-3 h-4 max-w-xl rounded-full bg-surface-card" />
      <div className="mx-auto h-4 max-w-md rounded-full bg-surface-card" />
    </div>
  </div>
}
