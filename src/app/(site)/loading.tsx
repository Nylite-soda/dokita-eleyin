export default function Loading() {
  return <div className="max-w-6xl mx-auto px-6 pt-40 pb-20" role="status" aria-live="polite">
    <span className="sr-only">Loading the page…</span>
    <div className="h-5 w-32 rounded bg-surface-card mb-6" />
    <div className="h-12 w-3/4 rounded bg-surface-card mb-6" />
    <div className="h-5 max-w-xl rounded bg-surface-card mb-3" />
    <div className="h-5 max-w-md rounded bg-surface-card" />
  </div>
}
