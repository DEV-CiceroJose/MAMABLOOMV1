import { readFile } from 'node:fs/promises'

export async function migrate(pool, schema = 'public') {
  if (!/^[a-z][a-z0-9_]{0,62}$/.test(schema)) throw new Error('Schema PostgreSQL inválido.')
  if (schema !== 'public') {
    await pool.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`)
    const { rows } = await pool.query('SELECT current_schema() AS schema')
    if (rows[0]?.schema !== schema) throw new Error('O schema ativo não corresponde ao schema configurado.')
  }
  const migrationUrl = new URL('../migrations/001_initial.sql', import.meta.url)
  const sql = await readFile(migrationUrl, 'utf8')
  await pool.query(sql)
}
