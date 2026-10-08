import { readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'

const testFiles = readdirSync(resolve('tests'))
  .filter((file) => file.endsWith('.test.mjs'))
  .map((file) => resolve('tests', file))

execFileSync(
  process.execPath,
  ['--loader', './scripts/test-loader.mjs', '--test', ...testFiles],
  {
    env: { ...process.env, DOKITA_SQLITE_TEST: '1' },
    stdio: 'inherit',
  },
)
