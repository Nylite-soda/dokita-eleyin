import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'

const temporary = mkdtempSync(join(tmpdir(), 'dokita-communications-tests-'))
const databasePath = join(temporary, 'communications.sqlite')
process.env.DATABASE_PATH = databasePath
process.env.DATABASE_URL = `file:${databasePath}`
process.env.DOKITA_SQLITE_TEST = '1'

execFileSync(process.execPath, [resolve('node_modules/prisma/build/index.js'), 'db', 'push', '--config', 'prisma.sqlite.config.ts'], {
  env: process.env,
  stdio: 'pipe',
})

const { getPrisma } = await import('../src/lib/prisma.ts')
const { createInquiry, getInquiries, getSubscribers, upsertSubscriber } = await import('../src/lib/communications.ts')
const db = getPrisma()

after(async () => {
  await db.$disconnect()
  assert.equal(dirname(resolve(temporary)), resolve(tmpdir()))
  assert.ok(basename(temporary).startsWith('dokita-communications-tests-'))
  rmSync(temporary, { recursive: true, force: true })
})

test('contact and partnership inquiries persist in the inbox database', async () => {
  const id = await createInquiry({
    kind: 'partnership',
    name: 'Test Contact',
    email: 'contact@example.test',
    organizationName: 'Test Organization',
    subject: 'Partnership request',
    message: 'Please contact us.',
    interest: ['school program'],
  })
  const [stored] = await getInquiries()

  assert.equal(stored.id, id)
  assert.equal(stored.kind, 'partnership')
  assert.equal(stored.email, 'contact@example.test')
  assert.equal(stored.organizationName, 'Test Organization')
  assert.deepEqual(stored.interest, ['school program'])
})

test('newsletter signups persist in the database for the admin subscriber list', async () => {
  const id = await upsertSubscriber('reader@example.test')
  const [stored] = await getSubscribers()

  assert.equal(stored.id, id)
  assert.equal(stored.email, 'reader@example.test')
  assert.equal(stored.status, 'subscribed')
  assert.ok(stored.consentedAt)
})
