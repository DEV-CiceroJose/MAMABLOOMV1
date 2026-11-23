import bcrypt from 'bcryptjs'
import { JsonFileRepository } from '../src/repository.js'
import { fileURLToPath } from 'node:url'

if (process.env.NODE_ENV === 'production') throw new Error('Demonstração disponível apenas fora de produção.')
// Este script não lê DATABASE_URL e não acessa os dados do Render.
const repository = await new JsonFileRepository(fileURLToPath(new URL('../data/local-features.json', import.meta.url))).initialize()
const password = 'MamaBloom@2026'
const accounts = [
  ['demo@mamabloom.local', 'Mamãe Demonstração', '00000000001'],
  ['amiga@mamabloom.local', 'Ana Demonstração', '00000000002'],
  ['psico@mamabloom.local', 'Psicóloga Demonstração', '00000000003'],
  ['admin@mamabloom.local', 'Administração Demonstração', '00000000004'],
  ['pendente@mamabloom.local', 'Profissional Pendente Demonstração', '00000000005'],
  ['beatriz@mamabloom.local', 'Beatriz Demonstração', '00000000006'],
  ['revisao@mamabloom.local', 'Psicólogo Aguardando Análise Demo', '00000000007'],
]
const users = []
for (const [email, name, cpf] of accounts) {
  let user = await repository.findUserByIdentity(email)
  if (!user) {
    user = await repository.createUser({ email, name, cpf, birthDate: '1995-05-15', passwordHash: await bcrypt.hash(password, 10) })
    await repository.updatePregnancy(user.id, { babyName: 'Luna', weeks: 20, lastPeriod: '2026-07-06' })
  }
  users.push(user)
}
await repository.setRecord(users[3].id, 'internal:role', 'admin')
await repository.mutateCommunity((state) => {
  for (const key of ['professionals', 'slots', 'consultations', 'messages', 'friendships', 'companies', 'reviews']) state[key] ||= []
  for (const index of [2, 4, 6]) if (!state.professionals.some((p) => p.userId === users[index].id)) state.professionals.push({ userId: users[index].id, birthDate: '1990-05-15', education: 'Perfil fictício para testar a navegação e o agendamento.', experience: 'Dados de demonstração. Não representa atendimento real.', registration: 'CRP fictício · DEMO', specialties: 'Demonstração da jornada materna', bio: 'Use este perfil apenas para validar a plataforma localmente.', status: index === 2 ? 'approved' : 'pending' })
  for (let offset = 0; offset < 4; offset++) {
    const startsAt = new Date(Date.now() + (offset * 24 * 60 + 60) * 60000)
    startsAt.setSeconds(0, 0)
    const dateKey = startsAt.toISOString().slice(0, 10)
    if (state.slots.some((s) => s.professionalId === users[2].id && s.startsAt.slice(0, 10) === dateKey)) continue
    const slot = { id: crypto.randomUUID(), professionalId: users[2].id, startsAt: startsAt.toISOString(), endsAt: new Date(startsAt.getTime() + 50 * 60000).toISOString() }
    state.slots.push(slot)
  }
  if (!state.companies.some((c) => c.cnpj === '00000000000001')) state.companies.push({ id: crypto.randomUUID(), ownerId: users[0].id, name: 'Empresa Demonstração', cnpj: '00000000000001', email: 'empresa@example.com', description: 'Cadastro fictício para testar a aprovação administrativa.', status: 'pending', createdAt: new Date().toISOString() })
})
console.log('Contas locais preparadas (senha MamaBloom@2026):')
for (const [email] of accounts) console.log(email)
