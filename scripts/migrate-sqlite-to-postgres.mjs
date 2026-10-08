import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname, join, sep } from 'node:path'
import Database from 'better-sqlite3'
import pg from 'pg'

if (existsSync('.env.local')) process.loadEnvFile('.env.local')

const sourcePath = resolve(process.env.LEGACY_SQLITE_PATH || 'data/site.sqlite')
const mediaDirectory = resolve(process.env.MEDIA_PATH || join(dirname(sourcePath), 'media'))
const connectionString = process.env.DIRECT_URL
const confirmed = process.argv.includes('--confirm-import')

if (!existsSync(sourcePath)) throw new Error(`Legacy SQLite database not found at ${sourcePath}.`)
if (!connectionString || !/^postgres(?:ql)?:\/\//i.test(connectionString)) {
  throw new Error('DIRECT_URL must contain the direct PostgreSQL URL before migrating local data.')
}
if (!confirmed) {
  throw new Error('This writes local SQLite content to Prisma Postgres. Review the target, then rerun with --confirm-import.')
}

const tableOrder = [
  'users',
  'booking_configuration',
  'booking_hours',
  'booking_blackouts',
  'booking_services',
  'cms_documents',
  'cms_revisions',
  'media',
  'subscribers',
  'inquiries',
  'bookings',
  'booking_outbox',
  'booking_payment_events',
  'audit_log',
  'sessions',
  'rate_limits',
]

const source = new Database(sourcePath, { readonly: true, fileMustExist: true })
const target = new pg.Client({ connectionString, connectionTimeoutMillis: 10_000 })
const copied = {}

try {
  await target.connect()
  const targetTables = await target.query(
    'select tablename from pg_tables where schemaname = current_schema()',
  )
  const targetTableSet = new Set(targetTables.rows.map((row) => row.tablename))
  for (const table of tableOrder) {
    assert(targetTableSet.has(table), `PostgreSQL table ${table} is missing. Apply Prisma migrations first.`)
  }

  await target.query('BEGIN')
  for (const table of tableOrder) {
    const rows = source.prepare(`SELECT * FROM "${table}"`).all()
    let imported = 0

    for (const sourceRow of rows) {
      const row = { ...sourceRow }
      if (table === 'media') {
        const storageName = String(row.storage_name)
        if (!/^[a-f0-9-]{36}\.(png|jpg|gif|webp)$/i.test(storageName)) {
          throw new Error('A legacy media path has an unexpected format; no records were copied.')
        }
        const mediaPath = resolve(mediaDirectory, storageName)
        if (!mediaPath.startsWith(`${mediaDirectory}${sep}`) || !existsSync(mediaPath)) {
          throw new Error('A legacy media file is missing; no records were copied.')
        }
        row.content = readFileSync(mediaPath)
      }

      const columns = Object.keys(row)
      const columnSql = columns.map((column) => `"${column}"`).join(', ')
      const valuesSql = columns.map((_, index) => `$${index + 1}`).join(', ')
      const values = columns.map((column) => row[column])
      const result = await target.query(
        `INSERT INTO "${table}" (${columnSql}) VALUES (${valuesSql}) ON CONFLICT DO NOTHING`,
        values,
      )
      imported += result.rowCount ?? 0
    }

    const count = await target.query(`SELECT count(*)::integer AS count FROM "${table}"`)
    if (Number(count.rows[0].count) < rows.length) {
      throw new Error(`PostgreSQL row count verification failed for ${table}; no records were committed.`)
    }
    copied[table] = { source: rows.length, inserted: imported }
  }

  await target.query(
    `SELECT setval(
      pg_get_serial_sequence('booking_configuration', 'id'),
      COALESCE((SELECT max(id) FROM booking_configuration), 1),
      EXISTS (SELECT 1 FROM booking_configuration)
    )`,
  )
  await target.query('COMMIT')
  console.log(JSON.stringify({ targetHost: new URL(connectionString).hostname, tables: copied }))
} catch (error) {
  await target.query('ROLLBACK').catch(() => {})
  throw error
} finally {
  source.close()
  await target.end().catch(() => {})
}
