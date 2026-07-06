// src/app/api/newsletter/route.ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email is invalid or missing' }, { status: 400 })
    }

    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY || '',
      },
      body: JSON.stringify({
        email,
        listIds: [Number(process.env.BREVO_LIST_ID)],
        updateEnabled: true,
      }),
    })

    if (response.status === 201 || response.status === 204) {
      return NextResponse.json({ message: 'Subscribed successfully' }, { status: 200 })
    }

    const responseData = await response.json().catch(() => ({}))

    if (responseData?.code === 'duplicate_parameter') {
      return NextResponse.json({ message: 'Already subscribed' }, { status: 200 })
    }

    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  } catch (err) {
    console.error('Newsletter error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}