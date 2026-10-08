import { resolve } from 'node:path'

export function getDatabasePath(env = process.env) {
  return resolve(env.LEGACY_SQLITE_PATH || env.DATABASE_PATH || 'data/site.sqlite')
}
