import assert from 'node:assert/strict'
import test from 'node:test'
import { loadConfig } from '../src/config.js'

test('permite iniciar com JSON sem DATABASE_URL e mantém PostgreSQL protegido por configuração', () => {
  const previous = {
    DATA_STORE: process.env.DATA_STORE,
    DATA_FILE_PATH: process.env.DATA_FILE_PATH,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    DATABASE_SCHEMA: process.env.DATABASE_SCHEMA,
  }

  try {
    process.env.JWT_SECRET = 'test-secret-with-at-least-32-characters'
    process.env.DATA_STORE = 'json'
    process.env.DATA_FILE_PATH = './data/test.json'
    delete process.env.DATABASE_URL

    const jsonConfig = loadConfig()
    assert.equal(jsonConfig.dataStore, 'json')
    assert.equal(jsonConfig.dataFilePath, './data/test.json')
    assert.equal(jsonConfig.databaseUrl, '')

    process.env.DATA_STORE = 'postgres'
    assert.throws(() => loadConfig(), /DATABASE_URL.*obrigatória/i)
    process.env.DATABASE_URL = 'postgres://localhost/example'
    process.env.DATABASE_SCHEMA = 'mamabloom'
    assert.equal(loadConfig().databaseSchema, 'mamabloom')
    process.env.DATABASE_SCHEMA = 'mamabloom;DROP SCHEMA public'
    assert.throws(() => loadConfig(), /DATABASE_SCHEMA/)
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  }
})
