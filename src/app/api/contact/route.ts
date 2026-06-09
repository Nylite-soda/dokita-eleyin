// src/app/api/contact/route.ts
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/mail'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, subject, message, organizationName, orgType, interest, contactPerson, phone } = body

    const senderName = name || contactPerson
    const senderEmail = email

    if (!senderName || !senderEmail || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const mailSubject = subject || (organizationName ? `Partnership: ${organizationName}` : `Inquiry from ${senderName}`)

    // Construct the email content dynamically
    const isPartnership = !!organizationName
    
    let emailHtml = `
      <div style="font-family: sans-serif; padding: 20px; color: #1A1A2E;">
        <h2 style="color: #2E5CA9;">New ${isPartnership ? 'Partnership Request' : 'Contact Message'}</h2>
        <p><strong>From:</strong> ${senderName} (${senderEmail})</p>
    `

    if (isPartnership) {
      emailHtml += `
        <p><strong>Organization:</strong> ${organizationName}</p>
        <p><strong>Org Type:</strong> ${orgType}</p>
        <p><strong>Interests:</strong> ${Array.isArray(interest) ? interest.join(', ') : interest}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
      `
    }

    emailHtml += `
        <p><strong>Subject:</strong> ${mailSubject}</p>
        <hr style="border: 0; border-top: 1px solid #EEF7FD; margin: 20px 0;" />
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
    `

    // Send email to Admin
    await sendEmail({
      to: process.env.EMAIL_SERVER_USER!,
      subject: `[Dokita Eleyin] ${mailSubject}`,
      html: emailHtml,
    })

    // Send auto-reply to User
    await sendEmail({
      to: senderEmail,
      subject: `Confirmation: We've received your inquiry`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1A1A2E; text-align: center;">
          <h2 style="color: #2E5CA9;">Hello ${senderName},</h2>
          <p>Thank you for reaching out to Dókítà Eléyín. We've received your ${isPartnership ? 'partnership request' : 'message'} and our team will get back to you as soon as possible.</p>
          <p>In the meantime, feel free to explore our <a href="${process.env.NEXT_PUBLIC_SITE_URL}/learning" style="color: #55C9F4;">Learning Hub</a> for dental health tips!</p>
          <br />
          <p>Keep smiling,<br /><strong>Dr. Ibukun & Team</strong></p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Contact API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
