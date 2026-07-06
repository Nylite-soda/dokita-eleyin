// src/lib/zeptomail.ts

interface SendEmailParams {
  to: {
    email: string
    name?: string
  }
  subject: string
  htmlBody: string
}

export const sendEmail = async ({ to, subject, htmlBody }: SendEmailParams) => {
  const apiKey = process.env.ZEPTOMAIL_API_KEY
  const fromEmail = process.env.ZEPTOMAIL_FROM_EMAIL

  if (!apiKey || !fromEmail) {
    throw new Error('ZeptoMail configuration is missing (ZEPTOMAIL_API_KEY or ZEPTOMAIL_FROM_EMAIL)')
  }

  const response = await fetch('https://api.zeptomail.com/v1.1/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Zoho-enczapikey ${apiKey}`,
    },
    body: JSON.stringify({
      from: {
        address: fromEmail,
      },
      to: [
        {
          email_address: {
            address: to.email,
            name: to.name || '',
          },
        },
      ],
      subject,
      htmlbody: htmlBody,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`ZeptoMail send failed: ${response.status} - ${errorText}`)
  }

  return await response.json()
}
