import { apiError } from '@/lib/auth'
import { readMedia } from '@/lib/media'
export const runtime = 'nodejs'
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params, media = await readMedia(id)
    return new Response(new Uint8Array(media.bytes), { headers: { 'Content-Type': media.mime, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff', 'Content-Disposition': 'inline' } })
  } catch (error) { return apiError(error) }
}
