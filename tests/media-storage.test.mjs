import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'

const temporary = mkdtempSync(join(tmpdir(), 'dokita-media-tests-'))
const databasePath = join(temporary, 'media.sqlite')
process.env.DATABASE_PATH = databasePath
process.env.DATABASE_URL = `file:${databasePath}`
process.env.DOKITA_SQLITE_TEST = '1'

execFileSync(process.execPath, [resolve('node_modules/prisma/build/index.js'), 'db', 'push', '--config', 'prisma.sqlite.config.ts'], {
  env: process.env,
  stdio: 'pipe',
})

const { getPrisma } = await import('../src/lib/prisma.ts')
const { deleteMedia, listMedia, readMedia, uploadMedia } = await import('../src/lib/media.ts')
const db = getPrisma()
const administrator = { id: randomUUID(), email: 'media-admin@example.test', name: 'Media admin', role: 'admin' }
await db.users.create({ data: { ...administrator, password_hash: 'test-only', active: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } })

after(async () => {
  await db.$disconnect()
  assert.equal(dirname(resolve(temporary)), resolve(tmpdir()))
  assert.ok(basename(temporary).startsWith('dokita-media-tests-'))
  rmSync(temporary, { recursive: true, force: true })
})

test('uploaded image bytes persist in the database and are served without exposing them in library listings', async () => {
  const bytes = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 1, 2, 3, 4])
  const uploaded = await uploadMedia(administrator, new File([bytes], 'test.png', { type: 'image/png' }), 'Test image')
  const stored = await db.media.findUnique({ where: { id: uploaded.id } })
  assert.deepEqual(Buffer.from(stored.content), bytes)
  assert.deepEqual(await readMedia(uploaded.id), { bytes, mime: 'image/png' })
  assert.equal('content' in (await listMedia())[0], false)

  await deleteMedia(administrator, uploaded.id)
  await assert.rejects(readMedia(uploaded.id), (error) => error.status === 404)
})
