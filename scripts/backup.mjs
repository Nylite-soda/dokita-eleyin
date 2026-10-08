import { DatabaseSync } from 'node:sqlite'
import { existsSync } from 'node:fs'
import { mkdir, cp, writeFile } from 'node:fs/promises'
import { resolve, dirname, join } from 'node:path'
import { getDatabasePath } from './database-path.mjs'

if (existsSync('.env.local')) process.loadEnvFile('.env.local')

const databasePath = getDatabasePath()
if (!existsSync(databasePath)) throw new Error(`Database does not exist: ${databasePath}. Run Prisma migrations before creating a backup.`)

const target = resolve(process.env.BACKUP_PATH || 'backups', new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-'))
await mkdir(target, { recursive: true })
const snapshot = join(target, 'site.sqlite')
const db = new DatabaseSync(databasePath, { readOnly: true })
try {
  // VACUUM INTO creates a consistent live snapshot, including committed WAL data.
  db.exec(`VACUUM INTO '${snapshot.replaceAll("'", "''")}'`)
} finally {
  db.close()
}

const media = resolve(process.env.MEDIA_PATH || resolve(dirname(databasePath), 'media'))
if (existsSync(media)) await cp(media, join(target, 'media'), { recursive: true, errorOnExist: true })
await writeFile(join(target, 'README.txt'), 'Stop the application before restoring. Preserve a backup of the current data directory, then restore site.sqlite and the media directory together. Backups contain private client and staff data; store them with restricted access.\n')
console.log(`Backup created at ${target}`)
