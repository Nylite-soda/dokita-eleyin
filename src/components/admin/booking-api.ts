export async function bookingAdminRequest<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(path, { method, headers: body === undefined ? undefined : { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body), credentials: 'same-origin' })
  const data: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const message = typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string' ? data.error : 'The request could not be completed. Please try again.'
    throw new Error(message)
  }
  return data as T
}

export function bookingAdminError(error: unknown): string {
  return error instanceof Error ? error.message : 'The request could not be completed. Please try again.'
}

export const bookingMoney = (value: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value)
export const bookingDate = (value: string) => new Date(value).toLocaleString('en-GB', { timeZone: 'Africa/Lagos', dateStyle: 'medium', timeStyle: 'short' })
export const localToBookingISO = (value: string) => new Date(`${value}:00+01:00`).toISOString()
export const bookingISOToLocal = (value: string) => new Date(Date.parse(value) + 60 * 60 * 1000).toISOString().slice(0, 16)
