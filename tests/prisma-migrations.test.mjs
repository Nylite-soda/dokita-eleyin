import assert from 'node:assert/strict'
import { test } from 'node:test'
import { DatabaseSync } from 'node:sqlite'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'

test('the checked-in baseline deploys cleanly to a fresh SQLite database', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'dokita-prisma-migration-test-'))
  const databasePath = join(temporary, 'fresh.sqlite')
  try {
    execFileSync(process.execPath, [resolve('node_modules/prisma/build/index.js'), 'migrate', 'deploy', '--config', 'prisma.sqlite.config.ts'], {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_PATH: databasePath, DATABASE_URL: `file:${databasePath}` },
      stdio: 'pipe',
    })

    const db = new DatabaseSync(databasePath, { readOnly: true })
    try {
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(row => row.name)
      assert.ok(tables.includes('cms_documents'))
      assert.ok(tables.includes('bookings'))
      assert.ok(tables.includes('booking_outbox'))
      const users = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").get()
      assert.match(users.sql, /CHECK\s*\(\s*"role"\s+IN\s*\('admin',\s*'editor'\)\s*\)/i)
      const indexes = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='index'").all()
      assert.ok(indexes.some(index => index.name === 'bookings_token_hash_key'))
      assert.ok(indexes.every(index => !/sqlite_autoindex/.test(index.sql || '')))
    } finally {
      db.close()
    }
  } finally {
    assert.equal(dirname(resolve(temporary)), resolve(tmpdir()))
    assert.ok(basename(temporary).startsWith('dokita-prisma-migration-test-'))
    rmSync(temporary, { recursive: true, force: true })
  }
})
