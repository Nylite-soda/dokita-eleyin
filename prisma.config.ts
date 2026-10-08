import nextEnv from '@next/env'
import { defineConfig } from 'prisma/config'

nextEnv.loadEnvConfig(process.cwd())

const directUrl = process.env.DIRECT_URL
if (!directUrl) {
  throw new Error('DIRECT_URL is required for Prisma CLI database operations. Add the direct Prisma Postgres URL to .env.local.')
}
if (!/^postgres(?:ql)?:\/\//i.test(directUrl)) {
  throw new Error('DIRECT_URL must be a PostgreSQL connection URL.')
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: directUrl },
})
