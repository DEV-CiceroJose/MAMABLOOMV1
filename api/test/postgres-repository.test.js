import assert from 'node:assert/strict'
import test from 'node:test'
import { newDb } from 'pg-mem'
import { migrate } from '../src/migrate.js'
import { PostgresRepository } from '../src/repository.js'

test('recusa uma migração quando a conexão aponta para outro schema', async () => {
  let tableMigrationRan = false
  const pool = { async query(sql) {
    if (sql.includes('CREATE TABLE')) tableMigrationRan = true
    return { rows: [{ schema: 'public' }] }
  } }
  await assert.rejects(migrate(pool, 'mamabloom'), /schema ativo/)
  assert.equal(tableMigrationRan, false)
  await assert.rejects(migrate(pool, 'public; DROP SCHEMA public'), /Schema PostgreSQL inválido/)
})

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
  await repository.updateProfile(user.id, { name: 'Ana Santos', email: 'nova@example.com', birthDate: '1999-01-15' })
  await repository.updateProfile(user.id, { name: 'Ana Santos', email: 'nova@example.com', birthDate: '1999-01-15', pregnancy: { lastPeriod: '2026-05-01', weeks: 14, babyName: 'Luna' } })
  const profile = await repository.findUserByIdentity('nova@example.com')
  await repository.setRecord(user.id, 'mamabloom:diary', [{ id: 'entry-1' }])
  const record = await repository.getRecord(user.id, 'mamabloom:diary')

  assert.equal(foundByEmail.id, user.id)
  assert.equal(profile.name, 'Ana Santos')
  assert.equal(profile.birthDate, '1999-01-15')
  assert.equal(profile.passwordHash, 'hash-protegido')
  assert.deepEqual(profile.pregnancy, { lastPeriod: '2026-05-01', weeks: 14, babyName: 'Luna' })
  assert.deepEqual(updated.pregnancy, { lastPeriod: '2026-05-01', weeks: 14 })
  assert.deepEqual(record.value, [{ id: 'entry-1' }])
  assert.equal(record.key, 'mamabloom:diary')

  await pool.end()
})
