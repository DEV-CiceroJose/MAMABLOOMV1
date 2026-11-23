import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import request from 'supertest'
import { newDb } from 'pg-mem'
import { createApp } from '../src/app.js'
import { JsonFileRepository, PostgresRepository } from '../src/repository.js'
import { migrate } from '../src/migrate.js'

async function fixture(t, storage = 'json') {
  let repository
  if (storage === 'json') {
    const directory = await mkdtemp(join(tmpdir(), 'mamabloom-community-'))
    repository = await new JsonFileRepository(join(directory, 'test.json')).initialize()
    t.after(() => rm(directory, { recursive: true, force: true }))
  } else {
    const db = newDb({ noAstCoverageCheck: true })
    const pool = new (db.adapters.createPg().Pool)()
    await migrate(pool)
    repository = new PostgresRepository(pool)
    t.after(() => pool.end())
  }
  const app = createApp({ repository, config: { jwtSecret: 'test-community-secret-with-32-characters', corsOrigins: ['http://localhost:5173'], bcryptRounds: 4 } })
  const clients = []
  const users = []
  for (let index = 0; index < 4; index++) {
    const client = request.agent(app)
    const result = await client.post('/v1/auth/register').send({ name: `Pessoa Teste ${index}`, email: `person${index}@example.com`, cpf: `0000000000${index}`, birthDate: '1990-01-01', password: 'password123' })
    assert.equal(result.status, 201)
    clients.push(client); users.push(result.body.user)
  }
  await repository.setRecord(users[0].id, 'internal:role', 'admin')
  return { repository, app, admin: clients[0], pro: clients[1], patient: clients[2], outsider: clients[3], users }
}
const profile = { birthDate: '1990-01-01', education: 'Formação de teste', experience: 'Experiência de teste', registration: 'CRP TESTE', specialties: 'Maternidade', bio: 'Perfil de teste automatizado' }
async function approved(f) {
  assert.equal((await f.pro.put('/v1/community/professional').send(profile)).status, 200)
  assert.equal((await f.admin.put(`/v1/community/admin/professionals/${f.users[1].id}`).send({ status: 'approved' })).status, 200)
}
async function slot(f) {
  const result = await f.pro.post('/v1/community/slots').send({ startsAt: new Date(Date.now() + 86400000).toISOString(), duration: 50 })
  assert.equal(result.status, 200)
  return result.body
}

for (const storage of ['json', 'postgres']) {
  test(`${storage}: aprovação restrita, agenda e chat bilateral com dados persistentes`, async (t) => {
    const f = await fixture(t, storage)
    assert.equal((await request(f.app).get('/v1/community/professionals')).status, 401)
    await f.pro.put('/v1/community/professional').send(profile)
    assert.equal((await f.patient.get('/v1/community/professionals')).body.professionals.length, 0)
    assert.equal((await f.pro.post('/v1/community/slots').send({ startsAt: new Date(Date.now() + 86400000).toISOString(), duration: 50 })).status, 403)
    assert.equal((await f.pro.put(`/v1/community/admin/professionals/${f.users[1].id}`).send({ status: 'approved' })).status, 403)
    assert.equal((await f.patient.get('/v1/community/admin')).status, 403)
    assert.equal((await f.patient.put('/v1/data/internal%3Arole').send({ value: 'admin' })).status, 422)
    await approved(f)
    const listed = (await f.patient.get('/v1/community/professionals')).body.professionals
    assert.equal(listed.length, 1)
    assert.equal(listed[0].birthDate, undefined)
    assert.equal(listed[0].education, profile.education)
    const available = await slot(f)
    assert.equal((await f.pro.post('/v1/community/consultations').send({ slotId: available.id })).status, 422)
    const booking = await f.patient.post('/v1/community/consultations').send({ slotId: available.id })
    assert.equal(booking.status, 200)
    const id = booking.body.id
    assert.equal((await f.outsider.post('/v1/community/consultations').send({ slotId: available.id })).status, 409)
    assert.equal((await f.patient.get(`/v1/community/slots/${f.users[1].id}`)).body.slots.length, 0)
    assert.equal((await f.outsider.get('/v1/community/consultations')).body.consultations.length, 0)
    assert.equal((await f.outsider.get(`/v1/community/consultations/${id}/messages`)).status, 404)
    assert.equal((await f.outsider.post(`/v1/community/consultations/${id}/messages`).send({ text: 'invasão', clientId: crypto.randomUUID() })).status, 404)
    const message = { text: 'Olá, gostaria de conversar antes da consulta.', clientId: crypto.randomUUID() }
    assert.equal((await f.patient.post(`/v1/community/consultations/${id}/messages`).send(message)).status, 200)
    await f.patient.post(`/v1/community/consultations/${id}/messages`).send(message)
    await f.pro.post(`/v1/community/consultations/${id}/messages`).send({ text: 'Olá! Podemos conversar por aqui.', clientId: crypto.randomUUID() })
    assert.equal((await f.patient.get(`/v1/community/consultations/${id}/messages`)).body.messages.length, 2)
    assert.equal((await f.pro.get(`/v1/community/consultations/${id}/messages`)).body.messages[0].text, message.text)
    const url = 'https://meet.google.com/abc-defg-hij'
    assert.equal((await f.patient.put(`/v1/community/consultations/${id}/meet`).send({ meetUrl: url })).status, 403)
    assert.equal((await f.pro.put(`/v1/community/consultations/${id}/meet`).send({ meetUrl: 'https://example.com/fake' })).status, 422)
    assert.equal((await f.pro.put(`/v1/community/consultations/${id}/meet`).send({ meetUrl: url })).status, 200)
    let view = (await f.patient.get('/v1/community/consultations')).body.consultations[0]
    assert.equal(view.meetUrl, '')
    assert.equal(view.canJoin, false)
    await f.repository.mutateCommunity((state) => { const c = state.consultations.find((c) => c.id === id); c.startsAt = new Date().toISOString(); c.endsAt = new Date(Date.now() + 60000).toISOString() })
    view = (await f.patient.get('/v1/community/consultations')).body.consultations[0]
    assert.equal(view.meetUrl, url)
    assert.equal(view.canJoin, true)
    await f.repository.mutateCommunity((state) => { state.consultations.find((c) => c.id === id).endsAt = new Date(Date.now() - 1000).toISOString() })
    assert.equal((await f.patient.get('/v1/community/consultations')).body.consultations[0].canJoin, false)
    // A edição de dados profissionais exige nova análise.
    await f.pro.put('/v1/community/professional').send({ ...profile, education: 'Formação atualizada' })
    assert.equal((await f.patient.get('/v1/community/professionals')).body.professionals.length, 0)
  })
}

test('reservas concorrentes no JSON confirmam apenas uma pessoa', async (t) => {
  const f = await fixture(t)
  await approved(f)
  const available = await slot(f)
  const results = await Promise.all([f.patient.post('/v1/community/consultations').send({ slotId: available.id }), f.outsider.post('/v1/community/consultations').send({ slotId: available.id })])
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 409])
  assert.equal((await f.repository.readCommunity()).consultations.length, 1)
})

test('empresas ficam pendentes e só administradores podem analisá-las; amizades não duplicam', async (t) => {
  const f = await fixture(t)
  const company = await f.patient.post('/v1/community/companies').send({ name: 'Empresa de teste', cnpj: '00000000000001', email: 'business@example.com', description: 'Empresa fictícia' })
  assert.equal(company.body.status, 'pending')
  const path = `/v1/community/admin/companies/${company.body.id}`
  assert.equal((await f.patient.put(path).send({ status: 'approved' })).status, 403)
  assert.equal((await f.admin.put(path).send({ status: 'rejected' })).status, 422)
  await f.admin.put(path).send({ status: 'rejected', reason: 'Dados incompletos' })
  assert.equal((await f.patient.get('/v1/community/companies')).body.companies[0].reason, 'Dados incompletos')
  assert.equal((await f.outsider.get('/v1/community/companies')).body.companies.length, 0)
  assert.equal((await f.admin.get('/v1/community/admin')).body.reviews[0].reviewedBy, f.users[0].id)
  for (let i = 0; i < 2; i++) assert.equal((await f.patient.post('/v1/community/friends').send({ userId: f.users[3].id })).status, 200)
  const friends = (await f.patient.get('/v1/community/friends')).body
  assert.equal(friends.friends.length, 1)
  assert.equal(friends.friends[0].email, undefined)
  assert.equal(friends.suggestions.some((u) => u.id === f.users[3].id), false)
  assert.equal((await f.outsider.get('/v1/community/friends')).body.friends[0].id, f.users[2].id)
  const chat = `/v1/community/friends/${f.users[3].id}/messages`
  const message = { text: 'Olá amiga!', clientId: crypto.randomUUID() }
  await f.patient.post(chat).send(message)
  await f.patient.post(chat).send(message)
  assert.equal((await f.outsider.get(`/v1/community/friends/${f.users[2].id}/messages`)).body.messages.length, 1)
  assert.equal((await f.pro.get(`/v1/community/friends/${f.users[2].id}/messages`)).status, 404)
  assert.equal((await f.pro.post(`/v1/community/friends/${f.users[2].id}/messages`).send({ text: 'Não autorizada', clientId: crypto.randomUUID() })).status, 404)
})

test('foto e nome do bebê persistem sem alterar as credenciais da conta', async (t) => {
  const f = await fixture(t)
  const avatarImage = 'data:image/png;base64,aGVsbG8='
  const result = await f.patient.put('/v1/auth/profile').send({ name: f.users[2].name, email: f.users[2].email, birthDate: '1990-01-01', babyName: 'Luna', avatarImage })
  assert.equal(result.status, 200)
  assert.equal(result.body.user.avatarImage, avatarImage)
  assert.equal((await f.patient.get('/v1/auth/me')).body.user.pregnancy.babyName, 'Luna')
  assert.equal((await f.patient.put('/v1/auth/profile').send({ name: f.users[2].name, email: f.users[2].email, birthDate: '1990-01-01', avatarImage: 'data:image/svg+xml;base64,aGVsbG8=' })).status, 422)
})
