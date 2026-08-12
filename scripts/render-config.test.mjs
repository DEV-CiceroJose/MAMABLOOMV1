import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { parse } from 'yaml'

test('declara site, API e PostgreSQL no Blueprint do Render', async () => {
  const blueprint = parse(await readFile('render.yaml', 'utf8'))
  const site = blueprint.services.find((service) => service.name === 'mamabloom')
  const api = blueprint.services.find((service) => service.name === 'mamabloom-api')
  const database = blueprint.databases.find((item) => item.name === 'mamabloom-db')

  assert.equal(site.runtime, 'static')
  assert.equal(site.autoDeployTrigger, 'commit')
  assert.equal(
    site.envVars.find((variable) => variable.key === 'VITE_API_URL').value,
    'https://mamabloom-api.onrender.com',
  )
  assert.equal(api.runtime, 'node')
  assert.equal(api.healthCheckPath, '/health')
  assert.deepEqual(
    api.envVars.find((variable) => variable.key === 'DATABASE_URL').fromDatabase,
    { name: 'mamabloom-db', property: 'connectionString' },
  )
  assert.equal(api.envVars.find((variable) => variable.key === 'JWT_SECRET').generateValue, true)
  assert.equal(database.plan, 'free')
  assert.deepEqual(database.ipAllowList, [])
})
