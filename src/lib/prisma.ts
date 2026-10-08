import 'server-only'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/postgres/client'

const globalPrisma = globalThis as typeof globalThis & { dokitaPrisma?: PrismaClient }

function databaseUrl() {
  const url = process.env.DATABASE_URL
  if (!url || !/^postgres(?:ql)?:\/\//i.test(url)) {
    throw new Error('DATABASE_URL must be the pooled PostgreSQL connection URL.')
  }
  return url
}

export function getPrisma() {
  if (globalPrisma.dokitaPrisma) return globalPrisma.dokitaPrisma
  const adapter = new PrismaPg({ connectionString: databaseUrl(), max: 5 })
  const client = new PrismaClient({ adapter })
  globalPrisma.dokitaPrisma = client
  return client
}

export const prisma = getPrisma()
