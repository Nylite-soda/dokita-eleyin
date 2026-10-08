interface EmailAddress { email: string; name?: string }
interface SendEmailParams {
  to: EmailAddress
  replyTo?: EmailAddress
  subject: string
  htmlBody: string
}

export async function sendEmail({ to, replyTo, subject, htmlBody }: SendEmailParams): Promise<void> {
  const apiKey = process.env.ZEPTOMAIL_API_KEY
  const fromEmail = process.env.ZEPTOMAIL_FROM_EMAIL
  if (!apiKey || !fromEmail) throw new Error('Email delivery is not configured.')

  const response = await fetch('https://api.zeptomail.com/v1.1/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Zoho-enczapikey ${apiKey}` },
    body: JSON.stringify({
      from: { address: fromEmail },
      to: [{ email_address: { address: to.email, name: to.name || '' } }],
      ...(replyTo ? { reply_to: [{ address: replyTo.email, name: replyTo.name || '' }] } : {}),
      subject,
      htmlbody: htmlBody,
    }),
    signal: AbortSignal.timeout(12_000),
  })
  // Provider response bodies can contain addresses or account details. Keep them
  // out of exceptions and logs; callers return a safe, actionable error instead.
  if (!response.ok) throw new Error(`Email delivery failed (${response.status}).`)
}
