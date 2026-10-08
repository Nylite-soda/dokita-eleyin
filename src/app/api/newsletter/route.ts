import { NextResponse } from 'next/server'
import { newsletterFormSchema } from '@/components/forms/form-schemas'
import { upsertSubscriber } from '@/lib/communications'
import { rateLimit } from '@/lib/auth'

export async function POST(req: Request) {
  try { await rateLimit(`newsletter:${req.headers.get('x-forwarded-for')?.split(',')[0] || 'local'}`, 10, 15 * 60) } catch { return NextResponse.json({ error: 'Too many requests. Please wait before trying again.' }, { status: 429 }) }
  let body: unknown
  try {
    const text = await req.text()
    if (text.length > 2000) return NextResponse.json({ error: 'Please enter an email address only.' }, { status: 413 })
    body = JSON.parse(text)
  } catch {
    return NextResponse.json({ error: 'The request could not be read. Please try again.' }, { status: 400 })
  }
  const result = newsletterFormSchema.safeParse(body)
  if (!result.success) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  await upsertSubscriber(result.data.email)
  return NextResponse.json({ success: true, stored: true })
}
