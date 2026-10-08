export async function bookingRequest<T>(url: string, body?: unknown): Promise<T> {
  const response = await fetch(url, body === undefined ? { cache: 'no-store' } : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const result: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const error = result && typeof result === 'object' && 'error' in result && typeof result.error === 'string' ? result.error : 'This request could not be completed. Please try again.'
    throw new Error(error)
  }
  return result as T
}
export const formatFee = (amount: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount)
export const formatSlot = (instant: string, timezone: string) => new Intl.DateTimeFormat('en-NG', { timeZone: timezone, month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(instant))
