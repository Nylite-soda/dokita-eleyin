// src/app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook'

export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody(req, process.env.SANITY_WEBHOOK_SECRET)

    if (!isValidSignature) {
      return new NextResponse('Invalid signature', { status: 401 })
    }

    if (!body?._type) {
      return new NextResponse('Bad Request', { status: 400 })
    }

    const type = (body as any)._type
    const slug = (body as any).slug?.current

    // Map Sanity types to their corresponding frontend paths
    if (type === 'article') {
      revalidatePath('/learning')
      if (slug) revalidatePath(`/learning/${slug}`)
      revalidatePath('/') // Homepage has featured articles
    } else if (type === 'category') {
      revalidatePath('/learning')
    } else if (type === 'impactStat') {
      revalidatePath('/')
      revalidatePath('/impact')
      revalidatePath('/founder')
    } else if (type === 'impactStory') {
      revalidatePath('/impact')
    } else if (type === 'outreachEvent') {
      revalidatePath('/')
      revalidatePath('/outreach')
      revalidatePath('/impact')
    } else if (type === 'program') {
      revalidatePath('/programs')
    } else if (type === 'partner') {
      revalidatePath('/partnerships')
    } else if (type === 'faq') {
      revalidatePath('/consultation') // If FAQ is used there
    } else if (type === 'homepageSettings') {
      revalidatePath('/')
    } else if (type === 'siteSettings') {
      revalidatePath('/', 'layout') // Revalidate everything using root layout
    } else if (type === 'founder') {
      revalidatePath('/founder')
      revalidatePath('/about')
    }

    return NextResponse.json({ 
      revalidated: true, 
      now: Date.now(), 
      type,
      slug: slug || 'none'
    })
  } catch (err: any) {
    console.error('Revalidation error:', err)
    return new NextResponse(err.message, { status: 500 })
  }
}