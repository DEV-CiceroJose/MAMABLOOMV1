import pg from 'pg'
import { createApp } from './app.js'
import { loadConfig } from './config.js'
import { migrate } from './migrate.js'
import { JsonFileRepository, PostgresRepository } from './repository.js'

const config = loadConfig()
let pool = null
let repository

if (config.dataStore === 'postgres') {
  pool = new pg.Pool({
    connectionString: config.databaseUrl,
    ssl: config.databaseSsl ? { rejectUnauthorized: false } : undefined,
  })
  await migrate(pool)
  repository = new PostgresRepository(pool)
} else {
  repository = await new JsonFileRepository(config.dataFilePath).initialize()
}

const app = createApp({ repository, config })
const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`MamaBloom API disponível na porta ${config.port} usando ${config.dataStore}.`)
})

async function shutdown() {
  server.close(async () => {
    if (pool) await pool.end()
    process.exit(0)
  })
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
