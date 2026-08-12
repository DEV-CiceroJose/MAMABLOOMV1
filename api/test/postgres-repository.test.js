import assert from 'node:assert/strict'
import test from 'node:test'
import { newDb } from 'pg-mem'
import { migrate } from '../src/migrate.js'
import { PostgresRepository } from '../src/repository.js'

test('a migração é idempotente e o repositório persiste usuários e módulos', async () => {
  const memoryDatabase = newDb({ noAstCoverageCheck: true })
  const adapter = memoryDatabase.adapters.createPg()
  const pool = new adapter.Pool()

  await migrate(pool)
  await migrate(pool)

  const repository = new PostgresRepository(pool)
  const user = await repository.createUser({
    name: 'Ana Clara Santos',
    email: 'ana@example.com',
    cpf: '12345678900',
    birthDate: '2000-05-20',
    passwordHash: 'hash-protegido',
  })
  const foundByEmail = await repository.findUserByIdentity('ana@example.com')
  const updated = await repository.updatePregnancy(user.id, { lastPeriod: '2026-05-01', weeks: 14 })
  await repository.setRecord(user.id, 'mamabloom:diary', [{ id: 'entry-1' }])
  const record = await repository.getRecord(user.id, 'mamabloom:diary')

  assert.equal(foundByEmail.id, user.id)
  assert.deepEqual(updated.pregnancy, { lastPeriod: '2026-05-01', weeks: 14 })
  assert.deepEqual(record.value, [{ id: 'entry-1' }])
  assert.equal(record.key, 'mamabloom:diary')

  await pool.end()
})
