// src/app/api/newsletter/route.ts
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/mail'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // This is where you'd call Brevo, Mailchimp, etc.
    // For now, we'll send a welcome email via Zoho
    await sendEmail({
      to: email,
      subject: 'Welcome to the Dókítà Eléyín Newsletter!',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1A1A2E; text-align: center;">
          <h2 style="color: #2E5CA9;">You're in!</h2>
          <p>Thank you for subscribing to our newsletter. You'll now receive monthly dental tips and community updates from Dr. Ibukun.</p>
          <p>We're excited to have you with us!</p>
          <br />
          <p>Keep smiling,<br /><strong>Dókítà Eléyín Team</strong></p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Newsletter error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}