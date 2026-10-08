import { apiError, assertSameOrigin, requireStaff, HttpError } from '@/lib/auth'
import { getDocument, updateDocument } from '@/lib/cms'
import { prisma } from '@/lib/prisma'
import { getDefinition } from '@/lib/cms-definition'
type Context = { params: Promise<{ id: string }> }
export async function GET(_request: Request, context: Context) {
  try {
    const user=await requireStaff()
    const { id } = await context.params
    const document = await getDocument(id)
    if (!document) throw new HttpError(404, 'Document not found.')
    if(getDefinition(document.type)?.adminOnly&&user.role!=='admin') throw new HttpError(403,'Administrator access is required.')
    const revisions = await prisma.cms_revisions.findMany({ where: { document_id: id }, select: { id: true, status: true, created_at: true }, orderBy: { created_at: 'desc' }, take: 50 })
    return Response.json({ document, revisions }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) { return apiError(error) }
}
export async function PATCH(request: Request, context: Context) {
  try {
    assertSameOrigin(request)
    const user = await requireStaff(), { id } = await context.params
    if (Number(request.headers.get('content-length')) > 260_000) throw new HttpError(413, 'This document is too large.')
    return Response.json({ document: await updateDocument(user, id, await request.json()) })
  } catch (error) { return apiError(error) }
}
