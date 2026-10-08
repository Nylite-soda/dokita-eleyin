'use client'

import { useEffect, useId, useState } from 'react'
import type { BookingSlot } from '@/lib/booking-types'
import { formatSlot } from './booking-client'
import DentalMotion from '@/components/ui/DentalMotion'

interface SlotPickerProps {
  serviceId: string
  date: string
  timezone: string
  selected: string
  onSelect: (slot: string) => void
  token?: string
}

export default function SlotPicker({ serviceId, date, timezone, selected, onSelect, token }: SlotPickerProps) {
  const id = useId()
  const key = `${serviceId}:${date}:${token || ''}`
  const [result, setResult] = useState<{ key: string; slots: BookingSlot[]; error?: string }>({ key: '', slots: [] })
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    if (!serviceId || !date) return
    const controller = new AbortController()
    const query = new URLSearchParams({ serviceId, date, ...(token ? { token } : {}) })
    void fetch(`/api/booking/slots?${query}`, { signal: controller.signal, cache: 'no-store' }).then(async response => {
      const data = await response.json() as { slots?: BookingSlot[]; error?: string }
      if (!response.ok) throw new Error(data.error || 'Available times could not be loaded.')
      setResult({ key, slots: data.slots || [] })
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setResult({ key, slots: [], error: error instanceof Error ? error.message : 'Available times could not be loaded.' })
    })
    return () => controller.abort()
  }, [serviceId, date, token, key, retry])

  if (!serviceId || !date) return <p className="text-ink/80">Choose a service and date to see times.</p>
  if (result.key !== key) return <div className="flex min-h-28 items-center gap-4 rounded-2xl bg-white px-5 py-4"><DentalMotion size="md" label="Checking the live appointment calendar" /><p className="text-ink/80">Checking available appointment times…</p></div>
  if (result.error) return <div role="alert" className="text-red-800 space-y-2"><p>{result.error}</p><button type="button" onClick={() => setRetry(value => value + 1)} className="underline underline-offset-4">Try loading times again</button></div>
  if (result.slots.length === 0) return <p role="status" className="text-ink/80">There are no available times on this date. Choose another date or contact the team.</p>
  return (
    <fieldset className="space-y-3">
      <legend className="font-bold text-brand-navy mb-3">Available times ({timezone})</legend>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{result.slots.map((slot, index) => (
        <label key={slot.startAt} htmlFor={`${id}-${index}`} className={`rounded-xl border p-3 text-center cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand-darkBlue ${selected === slot.startAt ? 'border-brand-darkBlue bg-brand-darkBlue text-white' : 'border-ink/20 text-brand-navy hover:bg-surface-soft'}`}>
          <input id={`${id}-${index}`} className="sr-only" type="radio" name={`${id}-slot`} checked={selected === slot.startAt} onChange={() => onSelect(slot.startAt)} value={slot.startAt} />
          {formatSlot(slot.startAt, timezone)}
        </label>
      ))}</div>
    </fieldset>
  )
}
