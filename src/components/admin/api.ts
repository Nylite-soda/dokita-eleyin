'use client'
export async function adminRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...options, headers: { ...(options?.body instanceof FormData ? {} : { 'Content-Type':'application/json' }), ...options?.headers } })
  const result = await response.json() as T & { error?: string }
  if (!response.ok) throw new Error(result.error || 'The request failed. Please try again.')
  return result
}
