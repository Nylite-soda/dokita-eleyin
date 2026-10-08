import test from 'node:test'
import assert from 'node:assert/strict'

process.env.ZEPTOMAIL_API_KEY = 'test-zeptomail-key'
process.env.ZEPTOMAIL_FROM_EMAIL = 'verified@example.com'

const { emailConfigured, sendEmail } = await import('../src/lib/email.ts')

test('ZeptoMail is configured only with an API key and valid sender address', () => {
  assert.equal(emailConfigured(), true)
  const previous = process.env.ZEPTOMAIL_FROM_EMAIL
  process.env.ZEPTOMAIL_FROM_EMAIL = 'not-an-email'
  assert.equal(emailConfigured(), false)
  process.env.ZEPTOMAIL_FROM_EMAIL = previous
})

test('transactional email is delivered through ZeptoMail', async () => {
  const previousFetch = globalThis.fetch
  let request
  globalThis.fetch = async (url, options) => {
    request = { url, options }
    return new Response(null, { status: 201 })
  }
  try {
    await sendEmail({
      to: { email: 'recipient@example.com', name: 'Recipient' },
      replyTo: { email: 'reply@example.com', name: 'Reply' },
      subject: 'Test message',
      htmlBody: '<p>Hello</p>',
    })
    assert.equal(request.url, 'https://api.zeptomail.com/v1.1/email')
    assert.equal(request.options.headers.Authorization, 'Zoho-enczapikey test-zeptomail-key')
    assert.deepEqual(JSON.parse(request.options.body), {
      from: { address: 'verified@example.com' },
      to: [{ email_address: { address: 'recipient@example.com', name: 'Recipient' } }],
      reply_to: [{ address: 'reply@example.com', name: 'Reply' }],
      subject: 'Test message',
      htmlbody: '<p>Hello</p>',
    })
  } finally {
    globalThis.fetch = previousFetch
  }
})

test('ZeptoMail error responses do not leak provider response bodies', async () => {
  const previousFetch = globalThis.fetch
  globalThis.fetch = async () => new Response('private provider detail', { status: 401 })
  try {
    await assert.rejects(sendEmail({ to: { email: 'recipient@example.com' }, subject: 'Test', htmlBody: '<p>Hello</p>' }), /Email delivery failed \(401\)/)
  } finally {
    globalThis.fetch = previousFetch
  }
})
