import { NextResponse } from 'next/server'
import { z } from 'zod'
import { contactFormSchema, partnershipFormSchema } from '@/components/forms/form-schemas'
import { sendEmail } from '@/lib/zeptomail'
import { createInquiry } from '@/lib/communications'
import { rateLimit } from '@/lib/auth'

const submissionSchema = z.union([contactFormSchema, partnershipFormSchema])
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] ?? character)

export async function POST(req: Request) {
  try { await rateLimit(`contact:${req.headers.get('x-forwarded-for')?.split(',')[0] || 'local'}`, 8, 15 * 60) } catch { return NextResponse.json({ error: 'Too many messages. Please wait before trying again.' }, { status: 429 }) }
  let body: unknown
  try {
    const text = await req.text()
    if (text.length > 24_000) return NextResponse.json({ error: 'Your message is too large. Please shorten it and try again.' }, { status: 413 })
    body = JSON.parse(text)
  } catch {
    return NextResponse.json({ error: 'The request could not be read. Please try again.' }, { status: 400 })
  }

  const result = submissionSchema.safeParse(body)
  if (!result.success) return NextResponse.json({ error: 'Please check all required fields and enter a valid email address.' }, { status: 400 })

  const adminEmail = process.env.ADMIN_EMAIL || process.env.ZEPTOMAIL_FROM_EMAIL
  const data = result.data
  const isPartnership = 'organizationName' in data
  const senderName = isPartnership ? data.contactPerson : data.name
  const subject = isPartnership ? `Partnership: ${data.organizationName}` : data.subject
  await createInquiry({ kind: isPartnership ? 'partnership' : 'contact', name: senderName, email: data.email, phone: isPartnership ? data.phone : '', organizationName: isPartnership ? data.organizationName : '', subject, message: data.message, interest: isPartnership ? data.interest : [] })
  if (!process.env.ZEPTOMAIL_API_KEY || !z.email().safeParse(process.env.ZEPTOMAIL_FROM_EMAIL).success || !z.email().safeParse(adminEmail).success) return NextResponse.json({ success: true, stored: true })
  const rows: [string, string][] = [
    ['From', `${senderName} (${data.email})`],
    ['Subject', subject],
  ]
  if (isPartnership) rows.push(['Organization', data.organizationName], ['Organization type', data.orgType], ['Interests', data.interest.join(', ')], ['Phone', data.phone])
  const htmlBody = `<div style="font-family:sans-serif;color:#1A1A2E;padding:20px"><h2>New ${isPartnership ? 'partnership request' : 'contact message'}</h2>${rows.map(([label, value]) => `<p><strong>${label}:</strong> ${escapeHtml(value)}</p>`).join('')}<hr /><p><strong>Message:</strong></p><p style="white-space:pre-wrap">${escapeHtml(data.message)}</p></div>`

  try {
    await sendEmail({
      to: { email: adminEmail!, name: 'Dókítà Eléyín team' },
      replyTo: { email: data.email, name: senderName },
      subject: `[Dokita Eleyin] ${subject.replace(/[\r\n]/g, ' ')}`,
      htmlBody,
    })
  } catch {
    console.error('Contact delivery failed.')
    // The inquiry is already persisted in the admin inbox. Returning an error
    // would invite a retry and create duplicate messages.
    return NextResponse.json({ success: true, stored: true })
  }

  // The request is accepted once the team notification succeeds. A failed courtesy
  // reply must not turn a delivered request into an error and encourage duplicates.
  try {
    await sendEmail({
      to: { email: data.email, name: senderName },
      subject: 'We have received your inquiry',
      htmlBody: `<div style="font-family:sans-serif;color:#1A1A2E;padding:20px"><h2>Hello ${escapeHtml(senderName)},</h2><p>Thank you for contacting Dókítà Eléyín. We have received your ${isPartnership ? 'partnership request' : 'message'} and our team will be in touch.</p><p>Keep smiling,<br />Dr. Ibukun &amp; Team</p></div>`,
    })
  } catch {
    console.error('Contact accepted; courtesy confirmation could not be delivered.')
  }
  return NextResponse.json({ success: true })
}
