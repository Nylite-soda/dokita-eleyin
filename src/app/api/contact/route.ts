// src/app/api/contact/route.ts
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/zeptomail'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().optional(),
  contactPerson: z.string().optional(),
  email: z.string().email('Invalid email address'),
  subject: z.string().optional(),
  message: z.string().min(10, 'Message is too short'),
  organizationName: z.string().optional(),
  orgType: z.string().optional(),
  interest: z.union([z.string(), z.array(z.string())]).optional(),
  phone: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Server-side Zod validation
    const result = contactSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 })
    }

    const { name, email, subject, message, organizationName, orgType, interest, contactPerson, phone } = result.data

    const senderName = name || contactPerson || 'User'
    const senderEmail = email

    const mailSubject = subject || (organizationName ? `Partnership: ${organizationName}` : `Inquiry from ${senderName}`)
    const isPartnership = !!organizationName

    // Styled HTML summary for Admin
    let adminEmailHtml = `
      <div style="font-family: sans-serif; padding: 20px; color: #1A1A2E;">
        <h2 style="color: #2E5CA9;">New ${isPartnership ? 'Partnership Request' : 'Contact Message'}</h2>
        <p><strong>From:</strong> ${senderName} (${senderEmail})</p>
    `

    if (isPartnership) {
      adminEmailHtml += `
        <p><strong>Organization:</strong> ${organizationName}</p>
        <p><strong>Org Type:</strong> ${orgType || 'N/A'}</p>
        <p><strong>Interests:</strong> ${Array.isArray(interest) ? interest.join(', ') : interest || 'N/A'}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
      `
    }

    adminEmailHtml += `
        <p><strong>Subject:</strong> ${mailSubject}</p>
        <hr style="border: 0; border-top: 1px solid #EEF7FD; margin: 20px 0;" />
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
    `

    // Send email to Admin (process.env.ADMIN_EMAIL)
    const adminEmail = process.env.ADMIN_EMAIL || process.env.ZEPTOMAIL_FROM_EMAIL || ''
    await sendEmail({
      to: { email: adminEmail, name: 'Admin' },
      subject: `[Dokita Eleyin] ${mailSubject}`,
      htmlBody: adminEmailHtml,
    })

    // Send auto-reply to User
    const autoReplyHtml = `
      <div style="font-family: sans-serif; padding: 20px; color: #1A1A2E; text-align: center;">
        <h2 style="color: #2E5CA9;">Hello ${senderName},</h2>
        <p>Thank you for reaching out to Dókítà Eléyín. We've received your ${isPartnership ? 'partnership request' : 'message'} and our team will get back to you within 2 business days.</p>
        <p>In the meantime, feel free to explore our <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://dokitaeleyin.com'}/learning" style="color: #55C9F4;">Learning Hub</a> for dental health tips!</p>
        <br />
        <p>Keep smiling,<br /><strong>Dr. Ibukun & Team</strong></p>
      </div>
    `
    await sendEmail({
      to: { email: senderEmail, name: senderName },
      subject: `Confirmation: We've received your inquiry`,
      htmlBody: autoReplyHtml,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Contact API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
