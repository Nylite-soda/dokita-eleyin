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

  const apiKey = process.env.BREVO_API_KEY
  const listId = Number(process.env.BREVO_LIST_ID)
  if (!apiKey || !Number.isSafeInteger(listId) || listId < 1) return NextResponse.json({ success: true, stored: true })

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify({ email: result.data.email, listIds: [listId], updateEnabled: true }),
      signal: AbortSignal.timeout(12_000),
    })
    if (response.ok) return NextResponse.json({ success: true })
    const responseData: unknown = await response.json().catch(() => null)
    if (responseData && typeof responseData === 'object' && 'code' in responseData && responseData.code === 'duplicate_parameter') return NextResponse.json({ success: true })
    return NextResponse.json({ success: true, stored: true })
  } catch {
    console.error('Newsletter provider request failed.')
    return NextResponse.json({ success: true, stored: true })
  }
}
