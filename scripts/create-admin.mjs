import { randomBytes, scryptSync, randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/postgres/client.ts'

if (existsSync('.env.local')) process.loadEnvFile('.env.local')

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD
const name = process.env.ADMIN_NAME?.trim() || 'Administrator'

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length < 12 || password.length > 128) {
  console.error('Set ADMIN_EMAIL, ADMIN_PASSWORD (12-128 characters), and optional ADMIN_NAME, then run npm run admin:create. Passwords are never printed.')
  process.exit(1)
}

const url = process.env.DATABASE_URL
if (!url || !/^postgres(?:ql)?:\/\//i.test(url)) {
  console.error('Set DATABASE_URL to the pooled PostgreSQL connection URL before creating an administrator.')
  process.exit(1)
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url, max: 5 }) })
const salt = randomBytes(16).toString('hex')
const passwordHash = `scrypt$32768$${salt}$${scryptSync(password, salt, 64, { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 }).toString('hex')}`
const now = new Date().toISOString()

try {
  const existing = await prisma.users.findUnique({ where: { email } })
  if (existing && !process.argv.includes('--reset')) {
    throw new Error('That account already exists. To recover it using trusted server access, run npm run admin:create -- --reset.')
  }

  if (existing) {
    await prisma.$transaction(async (tx) => {
      await tx.sessions.deleteMany({ where: { user_id: existing.id } })
      await tx.users.update({ where: { id: existing.id }, data: { name, password_hash: passwordHash, active: 1, role: 'admin', updated_at: now } })
    })
  } else {
    await prisma.users.create({ data: { id: randomUUID(), email, name, password_hash: passwordHash, role: 'admin', active: 1, created_at: now, updated_at: now } })
  }

  console.log(`Administrator ${existing ? 'recovered' : 'created'}. Sign in at /admin/login. Remove ADMIN_PASSWORD from your environment after setup.`)
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Administrator setup failed.')
  process.exitCode = 1
} finally {
  await prisma.$disconnect()
}
