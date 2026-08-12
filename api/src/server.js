import pg from 'pg'
import { createApp } from './app.js'
import { loadConfig } from './config.js'
import { migrate } from './migrate.js'
import { PostgresRepository } from './repository.js'

const config = loadConfig()
const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  ssl: config.databaseSsl ? { rejectUnauthorized: false } : undefined,
})

await migrate(pool)

const app = createApp({ repository: new PostgresRepository(pool), config })
const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`MamaBloom API disponível na porta ${config.port}.`)
})

async function shutdown() {
  server.close(async () => {
    await pool.end()
    process.exit(0)
  })
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
