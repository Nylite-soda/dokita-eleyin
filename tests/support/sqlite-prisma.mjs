import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../../src/generated/prisma/client.ts'

let client

export function getPrisma() {
  if (client) return client
  const url = process.env.DATABASE_URL
  if (!url?.startsWith('file:')) throw new Error('SQLite test client requires a file: DATABASE_URL.')
  client = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) })
  return client
}

export const prisma = getPrisma()
