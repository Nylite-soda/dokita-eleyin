import { apiError, assertSameOrigin, HttpError, requireAdmin, requireStaff } from '@/lib/auth'
import { deleteMedia, listMedia, uploadMedia } from '@/lib/media'
export const runtime = 'nodejs'
export async function GET() {
  try { await requireStaff(); return Response.json({ media: await listMedia() }, { headers: { 'Cache-Control': 'private, no-store' } }) }
  catch (error) { return apiError(error) }
}
export async function POST(request: Request) {
  try {
    assertSameOrigin(request)
    const user = await requireStaff()
    if (Number(request.headers.get('content-length')) > 5 * 1024 * 1024 + 100_000) throw new HttpError(413, 'Choose an image smaller than 5 MB.')
    const form = await request.formData(), file = form.get('file')
    if (!(file instanceof File)) throw new HttpError(400, 'Choose an image to upload.')
    return Response.json({ media: await uploadMedia(user, file, String(form.get('alt') || '')) }, { status: 201 })
  } catch (error) { return apiError(error) }
}
export async function DELETE(request: Request) {
  try {
    assertSameOrigin(request)
    const user = await requireAdmin(), { id } = await request.json()
    if (typeof id !== 'string' || !/^[a-f0-9-]{36}$/.test(id)) throw new HttpError(400, 'Choose a valid image.')
    await deleteMedia(user, id)
    return Response.json({ success: true })
  } catch (error) { return apiError(error) }
}
