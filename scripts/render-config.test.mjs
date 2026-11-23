import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { parse } from 'yaml'

test('reutiliza PostgreSQL existente com schema separado no Blueprint ativo', async () => {
  const blueprint = parse(await readFile('render.yaml', 'utf8'))
  const site = blueprint.services.find((service) => service.name === 'mamabloom')
  const api = blueprint.services.find((service) => service.name === 'mamabloom-api')

  assert.equal(site.runtime, 'static')
  assert.equal(site.autoDeployTrigger, 'commit')
  assert.equal(
    site.envVars.find((variable) => variable.key === 'VITE_API_URL').value,
    'https://mamabloom-api.onrender.com',
  )
  assert.equal(api.runtime, 'node')
  assert.equal(api.healthCheckPath, '/health')
  assert.equal(api.envVars.find((variable) => variable.key === 'DATA_STORE').value, 'postgres')
  assert.equal(api.envVars.find((variable) => variable.key === 'DATABASE_URL').sync, false)
  assert.equal(api.envVars.find((variable) => variable.key === 'DATABASE_SCHEMA').value, 'mamabloom')
  assert.equal(api.envVars.find((variable) => variable.key === 'JWT_SECRET').generateValue, true)
  assert.equal(blueprint.databases, undefined)
})

test('mantém pronto o Blueprint dedicado para ativar PostgreSQL', async () => {
  const blueprint = parse(await readFile('render.postgres.yaml', 'utf8'))
  const api = blueprint.services.find((service) => service.name === 'mamabloom-api')
  const database = blueprint.databases.find((item) => item.name === 'mamabloom-db')

  assert.equal(api.envVars.find((variable) => variable.key === 'DATA_STORE').value, 'postgres')
  assert.deepEqual(
    api.envVars.find((variable) => variable.key === 'DATABASE_URL').fromDatabase,
    { name: 'mamabloom-db', property: 'connectionString' },
  )
  assert.equal(database.plan, '0.1c-256mb')
  assert.deepEqual(database.ipAllowList, [])
})
