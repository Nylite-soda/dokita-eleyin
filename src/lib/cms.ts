import 'server-only'
import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { prisma } from './prisma'
import { HttpError, type AdminUser } from './auth'
import { getDefinition, getFieldValue } from './cms-definition'

export interface CmsDocument { id: string; type: string; slug: string | null; status: 'draft' | 'published'; data: Record<string, unknown>; publishedData: Record<string, unknown> | null; createdAt: string; updatedAt: string; publishedAt: string | null }
function mapDocument(row: { id: string; type: string; slug: string | null; status: string; data: string; published_data: string | null; created_at: string; updated_at: string; published_at: string | null }): CmsDocument {
  return { id: row.id, type: row.type, slug: row.slug, status: row.status as CmsDocument['status'], data: JSON.parse(row.data), publishedData: row.published_data ? JSON.parse(row.published_data) : null, createdAt: row.created_at, updatedAt: row.updated_at, publishedAt: row.published_at }
}
export async function listDocuments(type?: string): Promise<CmsDocument[]> {
  const rows = await prisma.cms_documents.findMany({ where: type ? { type } : undefined, orderBy: [{ type: 'asc' }, { updated_at: 'desc' }] })
  return rows.map(mapDocument)
}
export async function getDocument(id: string): Promise<CmsDocument | null> {
  const row = await prisma.cms_documents.findUnique({ where: { id } })
  return row ? mapDocument(row) : null
}

function validateData(type: string, data: unknown, publish: boolean): asserts data is Record<string, unknown> {
  const definition = getDefinition(type)
  if (!definition || !data || typeof data !== 'object' || Array.isArray(data)) throw new HttpError(400, 'Choose a valid content type and document.')
  if (JSON.stringify(data).length > 256_000) throw new HttpError(413, 'This document is too large. Upload images through the media library.')
  if (publish) {
    for (const field of definition.fields) {
      const value = getFieldValue(data as Record<string, unknown>, field.key)
      if (field.required && (value === undefined || value === null || (typeof value === 'string' && !value.trim()) || (Array.isArray(value) && !value.length))) throw new HttpError(400, `${field.label} is required before publishing.`)
      if (value === undefined || value === null || value === '') continue
      if (['text', 'textarea', 'date', 'select'].includes(field.kind) && typeof value !== 'string') throw new HttpError(400, `${field.label} must contain text.`)
      if (field.kind === 'number' && (!Number.isFinite(value) || Number(value) < 0)) throw new HttpError(400, `${field.label} must be a non-negative number.`)
      if (field.kind === 'boolean' && typeof value !== 'boolean') throw new HttpError(400, `${field.label} must be enabled or disabled.`)
      if (field.kind === 'strings' && (!Array.isArray(value) || value.some(item => typeof item !== 'string'))) throw new HttpError(400, `${field.label} must contain a list of text values.`)
      if (field.kind === 'date' && Number.isNaN(Date.parse(String(value)))) throw new HttpError(400, `${field.label} must contain a valid date.`)
      if (field.kind === 'select' && value && !field.options?.includes(String(value))) throw new HttpError(400, `${field.label} is not valid.`)
      if (field.kind === 'slug' && value && (typeof value !== 'object' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String((value as { current?: string }).current || '')))) throw new HttpError(400, 'Use a URL slug containing lowercase letters, numbers, and hyphens.')
      if (field.kind === 'richtext' && (!Array.isArray(value) || value.some(block => !block || typeof block !== 'object' || !['block', 'image'].includes(block._type) || (block._type === 'block' && (!Array.isArray(block.children) || block.children.some((child: unknown) => !child || typeof child !== 'object' || !('text' in child) || typeof child.text !== 'string')))))) throw new HttpError(400, `${field.label} contains invalid paragraphs.`)
      if (field.key === 'contactEmail' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) throw new HttpError(400, 'Enter a valid contact email address.')
      if (['website', 'mapUrl', 'heroPrimaryCTA.link', 'heroSecondaryCTA.link'].includes(field.key) && value && !/^(https?:\/\/|\/(?!\/))/.test(String(value))) throw new HttpError(400, `${field.label} must be a website URL or a local path.`)
    }
  }
}
function assertAccess(user: AdminUser, type: string, adminOperation = false) {
  const definition = getDefinition(type)
  if (!definition) throw new HttpError(400, 'Unknown content type.')
  if ((adminOperation || definition.adminOnly) && user.role !== 'admin') throw new HttpError(403, 'Only administrators can perform this operation.')
}
function slugFrom(data: Record<string, unknown>) {
  const slug = data.slug
  return slug && typeof slug === 'object' && 'current' in slug ? String(slug.current || '') || null : null
}
function invalidate() { revalidatePath('/', 'layout') }
export async function createDocument(user: AdminUser, type: string, data: unknown): Promise<CmsDocument> {
  assertAccess(user, type)
  validateData(type, data, false)
  const id = randomUUID(), now = new Date().toISOString()
  try {
    await prisma.$transaction(async tx => {
      if (getDefinition(type)?.singleton && await tx.cms_documents.findFirst({ where: { type }, select: { id: true } })) throw new HttpError(409, 'This settings document already exists. Edit the existing document.')
      await tx.cms_documents.create({ data: { id, type, slug: slugFrom(data), data: JSON.stringify(data), status: 'draft', created_at: now, updated_at: now, created_by: user.id, updated_by: user.id } })
      await tx.audit_log.create({ data: { id: randomUUID(), user_id: user.id, action: 'cms.create', target_id: id, details: JSON.stringify({ type }), created_at: now } })
    })
  } catch (error) {
    if (error instanceof HttpError) throw error
    throw new HttpError(409, 'This URL slug is already used.')
  }
  return (await getDocument(id))!
}

export async function updateDocument(user: AdminUser, id: string, input: { action: string; data?: unknown; updatedAt?: string; approved?: boolean; revisionId?: string }): Promise<CmsDocument | null> {
  const initial = await getDocument(id)
  if (!initial) throw new HttpError(404, 'This document could not be found.')
  assertAccess(user, initial.type, ['publish', 'unpublish', 'delete'].includes(input.action))
  if (input.updatedAt !== initial.updatedAt) throw new HttpError(409, 'Someone else changed this document. Reload it before saving.')
  const now = new Date(Math.max(Date.now(), Date.parse(initial.updatedAt) + 1)).toISOString()
  let result: CmsDocument | null
  try {
    result = await prisma.$transaction(async tx => {
      const row = await tx.cms_documents.findUnique({ where: { id } })
      if (!row) throw new HttpError(404, 'This document could not be found.')
      if (row.updated_at !== input.updatedAt) throw new HttpError(409, 'Someone else changed this document. Reload it before saving.')
      const document = mapDocument(row)
      if (input.action === 'delete') {
        await tx.cms_documents.delete({ where: { id } })
        await tx.audit_log.create({ data: { id: randomUUID(), user_id: user.id, action: 'cms.delete', target_id: id, details: JSON.stringify({ type: document.type }), created_at: now } })
        return null
      }
      await tx.cms_revisions.create({ data: { id: randomUUID(), document_id: id, data: JSON.stringify(document.data), status: document.status, user_id: user.id, created_at: now } })
      let changes: { data?: string; slug?: string | null; status?: string; published_data?: string | null; published_at?: string | null; updated_at: string; updated_by: string } = { updated_at: now, updated_by: user.id }
      if (input.action === 'save') {
        validateData(document.type, input.data, false)
        changes = { ...changes, data: JSON.stringify(input.data), slug: slugFrom(input.data) }
      } else if (input.action === 'publish') {
        validateData(document.type, document.data, true)
        const slug = slugFrom(document.data)
        if (slug) {
          const peers = await tx.cms_documents.findMany({ where: { type: document.type, status: 'published', id: { not: id } }, select: { published_data: true, data: true } })
          const used = peers.some(peer => {
            try { return slugFrom(JSON.parse(peer.published_data ?? peer.data)) === slug } catch { return false }
          })
          if (used) throw new HttpError(409, 'This URL slug is already published by another document.')
        }
        changes = { ...changes, status: 'published', published_data: row.data, published_at: now }
      } else if (input.action === 'unpublish') changes = { ...changes, status: 'draft', published_data: null, published_at: null }
      else if (input.action === 'restore') {
        const saved = await tx.cms_revisions.findFirst({ where: { id: input.revisionId || '', document_id: id }, select: { data: true } })
        if (!saved) throw new HttpError(404, 'This revision could not be found.')
        const restored: unknown = JSON.parse(saved.data)
        validateData(document.type, restored, false)
        changes = { ...changes, data: JSON.stringify(restored), slug: slugFrom(restored) }
      } else throw new HttpError(400, 'Unknown document action.')
      await tx.cms_documents.update({ where: { id }, data: changes })
      await tx.audit_log.create({ data: { id: randomUUID(), user_id: user.id, action: `cms.${input.action}`, target_id: id, details: JSON.stringify({ type: document.type }), created_at: now } })
      const updated = await tx.cms_documents.findUnique({ where: { id } })
      return updated ? mapDocument(updated) : null
    })
  } catch (error) {
    if (error instanceof HttpError) throw error
    throw new HttpError(409, 'This URL slug is already used.')
  }
  if (['publish', 'unpublish', 'delete'].includes(input.action)) invalidate()
  return result
}
