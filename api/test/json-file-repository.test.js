import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { JsonFileRepository } from '../src/repository.js'

test('persiste usuários e módulos no arquivo JSON e recupera os dados após reiniciar', async (context) => {
  const directory = await mkdtemp(join(tmpdir(), 'mamabloom-json-'))
  const filePath = join(directory, 'mamabloom.json')
  context.after(() => rm(directory, { recursive: true, force: true }))

  const repository = await new JsonFileRepository(filePath).initialize()
  const user = await repository.createUser({
    name: 'Ana Clara Santos',
    email: 'ana@example.com',
    cpf: '12345678900',
    birthDate: '2000-05-20',
    passwordHash: 'hash-protegido',
  })
  await repository.updatePregnancy(user.id, { lastPeriod: '2026-05-01', weeks: 14 })
  await repository.updateProfile(user.id, { name: 'Ana Santos', email: 'nova@example.com', birthDate: '1999-01-15', pregnancy: { lastPeriod: '2026-05-01', weeks: 14, babyName: 'Luna' } })
  await repository.setRecord(user.id, 'mamabloom:diary', [{ id: 'entry-1' }])

  const restartedRepository = await new JsonFileRepository(filePath).initialize()
  const restartedUser = await restartedRepository.findUserByIdentity('nova@example.com')
  const record = await restartedRepository.getRecord(user.id, 'mamabloom:diary')
  const storedFile = JSON.parse(await readFile(filePath, 'utf8'))

  assert.equal(restartedUser.id, user.id)
  assert.equal(restartedUser.name, 'Ana Santos')
  assert.equal(restartedUser.birthDate, '1999-01-15')
  assert.deepEqual(restartedUser.pregnancy, { lastPeriod: '2026-05-01', weeks: 14, babyName: 'Luna' })
  assert.deepEqual(record.value, [{ id: 'entry-1' }])
  assert.equal(storedFile.version, 1)
  assert.equal(storedFile.users[0].passwordHash, 'hash-protegido')
})

test('serializa gravações concorrentes sem perder módulos', async (context) => {
  const directory = await mkdtemp(join(tmpdir(), 'mamabloom-json-'))
  const filePath = join(directory, 'mamabloom.json')
  context.after(() => rm(directory, { recursive: true, force: true }))
  const repository = await new JsonFileRepository(filePath).initialize()
  const user = await repository.createUser({
    name: 'Bia Santos',
    email: 'bia@example.com',
    cpf: '98765432100',
    birthDate: '1998-02-10',
    passwordHash: 'hash-protegido',
  })

  await Promise.all([
    repository.setRecord(user.id, 'mamabloom:diary', [{ id: 'diary' }]),
    repository.setRecord(user.id, 'mamabloom:cart', [{ id: 'cart' }]),
  ])

  const restartedRepository = await new JsonFileRepository(filePath).initialize()
  assert.deepEqual((await restartedRepository.getRecord(user.id, 'mamabloom:diary')).value, [{ id: 'diary' }])
  assert.deepEqual((await restartedRepository.getRecord(user.id, 'mamabloom:cart')).value, [{ id: 'cart' }])
})

test('recusa iniciar com um arquivo JSON inválido', async (context) => {
  const directory = await mkdtemp(join(tmpdir(), 'mamabloom-json-'))
  const filePath = join(directory, 'mamabloom.json')
  context.after(() => rm(directory, { recursive: true, force: true }))
  await import('node:fs/promises').then(({ writeFile }) => writeFile(filePath, '{"version":2}'))

  await assert.rejects(
    new JsonFileRepository(filePath).initialize(),
    /arquivo de dados JSON.*inválido/i,
  )
})
