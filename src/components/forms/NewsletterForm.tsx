// src/components/forms/NewsletterForm.tsx
'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { cn } from '@/lib/utils'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type FormData = z.infer<typeof schema>

interface NewsletterFormProps {
  variant?: 'inline' | 'stacked'
  placeholder?: string
}

export default function NewsletterForm({ 
  variant = 'inline',
  placeholder = 'Enter your email address'
}: NewsletterFormProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (data: FormData) => {
    setStatus('loading')
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (response.ok) {
        setStatus('success')
        reset()
      } else {
        setStatus('error')
      }
    } catch (err) {
      setStatus('error')
    }
  }

  return (
    <div className="w-full max-w-md">
      {status === 'success' ? (
        <div className="bg-white/10 text-white p-4 rounded-2xl font-body text-center">
          Thanks for subscribing! Check your inbox soon.
        </div>
      ) : (
        <form 
          onSubmit={handleSubmit(onSubmit)} 
          className={cn(
            "flex gap-2",
            variant === 'stacked' ? "flex-col" : "flex-row"
          )}
        >
          <div className="flex-grow">
            <input
              {...register('email')}
              type="email"
              placeholder={placeholder}
              className="w-full bg-white text-ink px-8 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-lightBlue transition-all placeholder:text-ink/30"
            />
            {errors.email && (
              <p className="mt-2 ml-4 text-xs text-red-300 font-body">{errors.email.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={status === 'loading'}
            className="shrink-0 bg-brand-navy text-white font-bold px-8 py-3 rounded-full hover:bg-white hover:text-brand-navy transition-all disabled:opacity-50"
          >
            {status === 'loading' ? 'Joining...' : 'Subscribe'}
          </button>
        </form>
      )}
    </div>
  )
}

