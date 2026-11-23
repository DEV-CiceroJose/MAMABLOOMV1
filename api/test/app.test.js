import assert from 'node:assert/strict'
import test from 'node:test'
import request from 'supertest'
import { createApp } from '../src/app.js'
import { MemoryRepository } from './memory-repository.js'

const config = {
  jwtSecret: 'test-secret-with-at-least-32-characters',
  corsOrigins: ['http://localhost:5173'],
  bcryptRounds: 4,
}

function createTestApp(configOverrides = {}) {
  return createApp({ repository: new MemoryRepository(), config: { ...config, ...configOverrides } })
}

const validRegistration = {
  name: 'Ana Clara Santos',
  email: 'ana@example.com',
  cpf: '123.456.789-00',
  birthDate: '2000-05-20',
  password: 'segura123',
}

async function register(client, overrides = {}) {
  return client.post('/v1/auth/register').send({ ...validRegistration, ...overrides })
}

test('expõe um health check sem autenticação', async () => {
  const response = await request(createTestApp()).get('/health')

  assert.equal(response.status, 200)
  assert.deepEqual(response.body, { status: 'ok' })
})

test('cadastra uma gestante com senha protegida e retorna uma sessão', async () => {
  const response = await register(request.agent(createTestApp()))

  assert.equal(response.status, 201)
  assert.match(response.headers['set-cookie'][0], /mamabloom_session=.*HttpOnly/)
  assert.equal(response.body.user.name, validRegistration.name)
  assert.equal(response.body.user.email, validRegistration.email)
  assert.equal(response.body.user.passwordHash, undefined)
  assert.equal(response.body.user.cpf, undefined)
})

test('protege o cookie usado pelo site publicado em outra origem', async () => {
  const response = await register(request.agent(createTestApp({ secureCookies: true })))
  const sessionCookie = response.headers['set-cookie'][0]

  assert.match(sessionCookie, /HttpOnly/)
  assert.match(sessionCookie, /Secure/)
  assert.match(sessionCookie, /SameSite=None/)
})

test('recusa cadastro de pessoa com menos de 16 anos', async () => {
  const today = new Date()
  const birthDate = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate())
    .toISOString()
    .slice(0, 10)
  const response = await register(request.agent(createTestApp()), { birthDate })

  assert.equal(response.status, 422)
  assert.equal(response.body.error.code, 'VALIDATION_ERROR')
})

test('autentica por e-mail ou CPF e rejeita senha incorreta', async () => {
  const app = createTestApp()
  await register(request.agent(app))

  const emailLogin = await request(app)
    .post('/v1/auth/login')
    .send({ identity: 'ANA@EXAMPLE.COM', password: validRegistration.password })
  const cpfLogin = await request(app)
    .post('/v1/auth/login')
    .send({ identity: '123.456.789-00', password: validRegistration.password })
  const invalidLogin = await request(app)
    .post('/v1/auth/login')
    .send({ identity: validRegistration.email, password: 'senha-errada' })

  assert.equal(emailLogin.status, 200)
  assert.equal(cpfLogin.status, 200)
  assert.equal(invalidLogin.status, 401)
})

test('atualiza os dados gestacionais da usuária autenticada', async () => {
  const app = createTestApp()
  const client = request.agent(app)
  await register(client)
  const response = await client
    .put('/v1/auth/pregnancy')
    .send({ lastPeriod: '2026-05-01', weeks: 14 })

  assert.equal(response.status, 200)
  assert.deepEqual(response.body.user.pregnancy, { lastPeriod: '2026-05-01', weeks: 14 })
})

test('encerra a sessão removendo o cookie HttpOnly', async () => {
  const client = request.agent(createTestApp())
  await register(client)

  const logout = await client.post('/v1/auth/logout')
  const me = await client.get('/v1/auth/me')

  assert.equal(logout.status, 204)
  assert.match(logout.headers['set-cookie'][0], /mamabloom_session=;/)
  assert.equal(me.status, 401)
})

test('persiste os módulos permitidos e isola os dados por usuária', async () => {
  const app = createTestApp()
  const firstClient = request.agent(app)
  const secondClient = request.agent(app)
  await register(firstClient)
  await register(secondClient, { email: 'bia@example.com', cpf: '98765432100' })
  const value = [{ id: 'entry-1', text: 'Hoje me senti acolhida.' }]

  const saved = await firstClient
    .put('/v1/data/mamabloom%3Adiary')
    .send({ value })
  const firstRead = await firstClient
    .get('/v1/data/mamabloom%3Adiary')
  const secondRead = await secondClient
    .get('/v1/data/mamabloom%3Adiary')

  assert.equal(saved.status, 200)
  assert.deepEqual(firstRead.body.value, value)
  assert.equal(secondRead.status, 404)
})

test('bloqueia chaves de armazenamento não reconhecidas', async () => {
  const app = createTestApp()
  const client = request.agent(app)
  await register(client)
  const response = await client
    .put('/v1/data/segredo')
    .send({ value: 'não deve entrar' })

  assert.equal(response.status, 422)
  assert.equal(response.body.error.code, 'INVALID_DATA_KEY')
})

test('salva contatos de confiança separados da emergência e de outras contas', async () => {
  const app = createTestApp()
  const client = request.agent(app)
  const other = request.agent(app)
  await register(client)
  await register(other, { email: 'outra@example.com', cpf: '98765432100' })
  const value = [{ id: 'ana', name: 'Ana', phone: '85999991234', relationship: 'Amigo(a)' }]
  assert.equal((await client.put('/v1/data/mamabloom:trusted-contacts').send({ value })).status, 200)
  assert.deepEqual((await client.get('/v1/data/mamabloom:trusted-contacts')).body.value, value)
  assert.equal((await client.get('/v1/data/mamabloom:emergency-card')).status, 404)
  assert.equal((await other.get('/v1/data/mamabloom:trusted-contacts')).status, 404)
  assert.equal((await client.put('/v1/data/mamabloom:trusted-contacts').send({ value: [{ ...value[0], phone: '123' }] })).status, 422)
})

test('edita os dados pessoais da própria conta e preserva credenciais e gestação', async () => {
  const app = createTestApp()
  const client = request.agent(app)
  await register(client)
  await client.put('/v1/auth/pregnancy').send({ lastPeriod: '2026-05-01', weeks: 14 })
  const changes = { name: 'Ana Santos', email: 'nova@example.com', birthDate: '1999-01-15' }
  const response = await client.put('/v1/auth/profile').send({ ...changes, passwordHash: 'forjado', id: 'outra-conta' })
  assert.equal(response.status, 200)
  const current = (await client.get('/v1/auth/me')).body.user
  assert.equal(current.name, changes.name)
  assert.equal(current.email, changes.email)
  assert.equal(current.birthDate, changes.birthDate)
  assert.deepEqual(current.pregnancy, { lastPeriod: '2026-05-01', weeks: 14 })
  assert.equal((await request(app).post('/v1/auth/login').send({ identity: changes.email, password: validRegistration.password })).status, 200)
  assert.equal((await request(app).put('/v1/auth/profile').send(changes)).status, 401)
  assert.equal((await client.put('/v1/auth/profile').send({ ...changes, birthDate: '2025-01-01' })).status, 422)
  const other = request.agent(app)
  await register(other, { email: 'outra@example.com', cpf: '98765432100' })
  assert.equal((await client.put('/v1/auth/profile').send({ ...changes, email: 'outra@example.com' })).status, 409)
})

test('salva o nome do bebê separado do nome da mãe e permite atualizar uma conta existente', async () => {
  const client = request.agent(createTestApp())
  await register(client)
  const gestation = await client.put('/v1/auth/pregnancy').send({ lastPeriod: '2026-05-01', weeks: 14, babyName: ' Luna ' })
  assert.equal(gestation.status, 200)
  assert.equal(gestation.body.user.pregnancy.babyName, 'Luna')
  assert.equal(gestation.body.user.name, validRegistration.name)
  const profile = { name: validRegistration.name, email: validRegistration.email, birthDate: validRegistration.birthDate }
  await client.put('/v1/auth/profile').send({ ...profile, babyName: 'Alice' })
  await client.put('/v1/auth/pregnancy').send({ lastPeriod: '2026-05-01', weeks: 15 })
  const current = (await client.get('/v1/auth/me')).body.user
  assert.equal(current.pregnancy.babyName, 'Alice')
  assert.equal(current.pregnancy.weeks, 15)
  assert.equal(current.name, validRegistration.name)
  assert.equal((await client.put('/v1/auth/profile').send({ ...profile, babyName: 'x'.repeat(81) })).status, 422)
})
