import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'

if (existsSync('.env.local')) process.loadEnvFile('.env.local')
const project = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
if (!project || !/^[a-z0-9]+$/.test(project) || !/^[a-z0-9_-]+$/.test(dataset)) throw new Error('Set legacy Sanity project/dataset variables for the one-time import.')
const types = ['siteSettings','homepageSettings','founder','article','category','program','outreachEvent','partner','impactStat','impactStory','faq']
const dryRun = process.argv.includes('--dry-run')
async function query(groq) {
  const url = new URL(`https://${project}.api.sanity.io/v2024-01-01/data/query/${dataset}`)
  url.searchParams.set('query', groq)
  url.searchParams.set('perspective', 'published')
  const headers = process.env.SANITY_API_TOKEN ? { Authorization: `Bearer ${process.env.SANITY_API_TOKEN}` } : {}
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(30000) })
  if (!response.ok) throw new Error(`Content export failed (${response.status}). No local content was replaced.`)
  const body = await response.json()
  if (!Array.isArray(body.result)) throw new Error('Unexpected legacy content response.')
  return body.result
}
const [documents, assets] = await Promise.all([query(`*[_type in ${JSON.stringify(types)} && !(_id in path("drafts.**"))]`), query('*[_type == "sanity.imageAsset"]')])
const counts = Object.fromEntries(types.map(type=>[type,documents.filter(doc=>doc._type===type).length]))
console.log(JSON.stringify({ mode: dryRun ? 'dry-run' : 'import', documents:documents.length, assets:assets.length, counts }))
if (!dryRun) {
  const { getPrisma } = await import('../src/lib/prisma.ts')
  const db = getPrisma()
  try {
  const folder = resolve(process.env.MEDIA_PATH || 'data/media')
  await mkdir(folder, { recursive: true })
  const media = new Map()
  const mediaRows = []
  for (const asset of assets) {
    const source = new URL(asset.url)
    if (source.protocol !== 'https:' || source.hostname !== 'cdn.sanity.io') throw new Error('Unexpected asset host in export.')
    const hash = createHash('sha256').update(asset._id).digest('hex').slice(0,32)
    const id = `${hash.slice(0,8)}-${hash.slice(8,12)}-${hash.slice(12,16)}-${hash.slice(16,20)}-${hash.slice(20)}`
    const extension = ({ jpeg:'jpg',jpg:'jpg',png:'png',gif:'gif',webp:'webp' })[asset.extension]
    if (!extension) throw new Error('The import contains an unsupported image format. Convert it before switching content providers.')
    const mime = ({jpg:'image/jpeg',png:'image/png',gif:'image/gif',webp:'image/webp'})[extension]
    const storage = `${id}.${extension}`
    if (!existsSync(resolve(folder,storage))) {
      const response = await fetch(source, { signal: AbortSignal.timeout(30000) })
      if (!response.ok) throw new Error(`Image download failed (${response.status}). Retry the import.`)
      const bytes = Buffer.from(await response.arrayBuffer())
      if (bytes.length > 20*1024*1024) throw new Error('Legacy image exceeds the 20 MB import limit.')
      await writeFile(resolve(folder,storage),bytes,{flag:'wx'})
    }
    const content = await readFile(resolve(folder,storage))
    mediaRows.push({ id, filename: asset.originalFilename || storage, storage_name: storage, mime_type: mime, size: content.length, content, alt: asset.altText || '', created_at: asset._createdAt || new Date().toISOString() })
    media.set(asset._id,{_type:'reference',_ref:`local-${id}`,url:`/media/${id}`})
  }
  function transform(value) {
    if (Array.isArray(value)) return value.map(transform)
    if (!value || typeof value !== 'object') return value
    if (value._type==='image' && value.asset?._ref) {
      const imported = media.get(value.asset._ref)
      if (!imported) throw new Error('Referenced media was not included in the export; import stopped without replacing documents.')
      return {...value,asset:imported}
    }
    return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,transform(item)]))
  }
  const converted = documents.map(document=>transform(document))
  const documentRows = converted.map(document => {
    const json = JSON.stringify(document)
    const now = document._updatedAt || new Date().toISOString()
    return { id: document._id, type: document._type, slug: document.slug?.current || null, status: 'published', data: json, published_data: json, created_at: document._createdAt || now, updated_at: now, published_at: now }
  })
  const imported = await db.$transaction(async tx => {
    if (mediaRows.length) await tx.media.createMany({ data: mediaRows, skipDuplicates: true })
    if (!documentRows.length) return 0
    const result = await tx.cms_documents.createMany({ data: documentRows, skipDuplicates: true })
    return result.count
  })
  console.log(JSON.stringify({imported,alreadyPresent:documents.length-imported,mediaCopied:media.size,remoteModified:false}))
  } finally {
    await db.$disconnect()
  }
}
