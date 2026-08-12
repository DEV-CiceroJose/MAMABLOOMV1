import { readFile } from 'node:fs/promises'

export async function migrate(pool) {
  const migrationUrl = new URL('../migrations/001_initial.sql', import.meta.url)
  const sql = await readFile(migrationUrl, 'utf8')
  await pool.query(sql)
}
