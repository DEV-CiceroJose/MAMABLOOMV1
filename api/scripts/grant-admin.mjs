import pg from 'pg'
import { loadConfig } from '../src/config.js'
import { JsonFileRepository, PostgresRepository } from '../src/repository.js'

const userId = process.argv[2]
if (!/^[0-9a-f-]{36}$/i.test(userId || '')) throw new Error('Uso: node scripts/grant-admin.mjs <UUID da conta existente>')
const config = loadConfig()
let pool
try {
  let repository
  if (config.dataStore === 'json') repository = await new JsonFileRepository(config.dataFilePath).initialize()
  else {
    pool = new pg.Pool({ connectionString: config.databaseUrl, ssl: config.databaseSsl ? { rejectUnauthorized: false } : undefined, options: `-c search_path=${config.databaseSchema}` })
    repository = new PostgresRepository(pool)
  }
  if (!await repository.findUserById(userId)) throw new Error('Conta não encontrada. Nenhum privilégio foi concedido.')
  await repository.setRecord(userId, 'internal:role', 'admin')
  console.log('Privilégio administrativo concedido à conta informada.')
} finally { if (pool) await pool.end() }
