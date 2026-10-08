'use client'

import { useEffect, useRef, useState } from 'react'

type SubmissionStatus = 'idle' | 'loading' | 'success' | 'error'

export function useSubmission(endpoint: string, fallbackError: string) {
  const [status, setStatus] = useState<SubmissionStatus>('idle')
  const [error, setError] = useState('')
  const feedbackRef = useRef<HTMLDivElement>(null)
  const pending = useRef(false)

  useEffect(() => {
    if (status === 'success' || status === 'error') feedbackRef.current?.focus()
  }, [status])

  async function submit(data: unknown): Promise<boolean> {
    if (pending.current) return false
    pending.current = true
    setStatus('loading')
    setError('')
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const result: unknown = await response.json().catch(() => null)
        const detail = result && typeof result === 'object' && 'error' in result && typeof result.error === 'string' ? result.error : fallbackError
        setError(detail)
        setStatus('error')
        return false
      }
      setStatus('success')
      return true
    } catch {
      setError(fallbackError)
      setStatus('error')
      return false
    } finally {
      pending.current = false
    }
  }

  return { status, error, feedbackRef, submit, startAgain: () => setStatus('idle') }
}
