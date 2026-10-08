import { apiError, assertSameOrigin, requireStaff, HttpError } from '@/lib/auth'
import { createDocument, listDocuments } from '@/lib/cms'
import { getDefinition } from '@/lib/cms-definition'
export const runtime = 'nodejs'
export async function GET(request: Request) {
  try { const user=await requireStaff(); return Response.json({ documents: (await listDocuments(new URL(request.url).searchParams.get('type') || undefined)).filter(document=>user.role==='admin'||!getDefinition(document.type)?.adminOnly) }, { headers: { 'Cache-Control': 'private, no-store' } }) }
  catch (error) { return apiError(error) }
}
export async function POST(request: Request) {
  try {
    assertSameOrigin(request)
    const user = await requireStaff()
    if (Number(request.headers.get('content-length')) > 260_000) throw new HttpError(413, 'This document is too large.')
    const body = await request.json()
    return Response.json({ document: await createDocument(user, body.type, body.data) }, { status: 201 })
  } catch (error) { return apiError(error) }
}
