import 'server-only'
import { randomUUID } from 'node:crypto'
import { prisma } from './prisma'
import type { AdminUser } from './auth'
import { HttpError } from './http-error'

const MAX_BYTES = 5 * 1024 * 1024
export async function listMedia() {
  const rows = await prisma.media.findMany({
    orderBy: { created_at: 'desc' },
    select: { id: true, filename: true, mime_type: true, size: true, alt: true, created_at: true },
  })
  return rows.map(row => ({ id: row.id, filename: row.filename, mimeType: row.mime_type, size: row.size, alt: row.alt, createdAt: row.created_at, url: `/media/${row.id}`, image: { _type: 'image', asset: { _ref: `local-${row.id}`, url: `/media/${row.id}` }, alt: row.alt } }))
}
function identify(buffer: Buffer) {
  if (buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return { mime: 'image/png', extension: 'png' }
  if (buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) return { mime: 'image/jpeg', extension: 'jpg' }
  if (['GIF87a','GIF89a'].includes(buffer.subarray(0,6).toString('ascii'))) return { mime: 'image/gif', extension: 'gif' }
  if (buffer.subarray(0,4).toString('ascii') === 'RIFF' && buffer.subarray(8,12).toString('ascii') === 'WEBP') return { mime: 'image/webp', extension: 'webp' }
  throw new HttpError(400, 'Upload a PNG, JPEG, GIF, or WebP image. SVG and executable files are not accepted.')
}
export async function uploadMedia(user: AdminUser, file: File, alt: string) {
  if (!file.size || file.size > MAX_BYTES) throw new HttpError(413, 'Choose an image smaller than 5 MB.')
  if (!alt.trim() || alt.length > 250) throw new HttpError(400, 'Describe the image in 1–250 characters for accessibility.')
  const buffer = Buffer.from(await file.arrayBuffer()), { mime, extension } = identify(buffer)
  const id = randomUUID(), storageName = `${id}.${extension}`
  const now = new Date().toISOString()
  await prisma.$transaction([
    prisma.media.create({ data: { id, filename: file.name.replace(/[^a-zA-Z0-9_. -]/g, '').slice(0,150) || storageName, storage_name: storageName, mime_type: mime, size: file.size, content: buffer, alt: alt.trim(), uploaded_by: user.id, created_at: now } }),
    prisma.audit_log.create({ data: { id: randomUUID(), user_id: user.id, action: 'media.upload', target_id: id, details: '{}', created_at: now } }),
  ])
  return (await listMedia()).find(item => item.id === id)!
}
export async function deleteMedia(user: AdminUser, id: string) {
  const [used, revision] = await Promise.all([
    prisma.cms_documents.findFirst({ where: { OR: [{ data: { contains: id } }, { published_data: { contains: id } }] }, select: { id: true } }),
    prisma.cms_revisions.findFirst({ where: { data: { contains: id } }, select: { id: true } }),
  ])
  if (used || revision) throw new HttpError(409, 'This image is used by content or its revision history. Keep it to preserve those documents.')
  const row = await prisma.media.findUnique({ where: { id }, select: { storage_name: true } })
  if (!row) throw new HttpError(404, 'Image not found.')
  await prisma.$transaction([
    prisma.media.delete({ where: { id } }),
    prisma.audit_log.create({ data: { id: randomUUID(), user_id: user.id, action: 'media.delete', target_id: id, details: '{}', created_at: new Date().toISOString() } }),
  ])
}
export async function readMedia(id: string) {
  if (!/^[a-f0-9-]{36}$/.test(id)) throw new HttpError(404, 'Image not found.')
  const row = await prisma.media.findUnique({ where: { id }, select: { storage_name: true, mime_type: true, content: true } })
  if (!row || !/^[a-f0-9-]{36}\.(png|jpg|gif|webp)$/.test(String(row.storage_name))) throw new HttpError(404, 'Image not found.')
  if (!row.content) throw new HttpError(404, 'Image not found.')
  return { bytes: Buffer.from(row.content), mime: String(row.mime_type) }
}
