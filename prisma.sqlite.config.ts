import { defineConfig } from 'prisma/config'

const url = process.env.DATABASE_URL || 'file:./data/site.sqlite'
if (!url.startsWith('file:')) {
  throw new Error('SQLite test tooling requires a file: DATABASE_URL.')
}

export default defineConfig({
  schema: 'prisma/schema.sqlite.prisma',
  migrations: { path: 'prisma/migrations-sqlite' },
  datasource: { url },
})
