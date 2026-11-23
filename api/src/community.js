import { z } from 'zod'
import rateLimit from 'express-rate-limit'

const text = (max = 200) => z.string().trim().min(1).max(max)
const profileSchema = z.object({ birthDate: z.iso.date(), education: text(800), experience: text(1200), registration: text(40), specialties: text(300), bio: text(1200) }).strict()
const companySchema = z.object({ name: text(120), cnpj: z.string().regex(/^\d{14}$/), email: z.email(), description: text(1000) }).strict()
const reviewSchema = z.object({ status: z.enum(['approved', 'rejected']), reason: z.string().trim().max(500).default('') }).strict()
const slotSchema = z.object({ startsAt: z.iso.datetime({ offset: true }), duration: z.number().int().min(30).max(120) }).strict()
const messageSchema = z.object({ text: text(2000), clientId: z.uuid() }).strict()

function fail(status, message) { throw Object.assign(new Error(message), { status }) }
function parse(schema, body) {
  const result = schema.safeParse(body)
  if (!result.success) fail(422, 'Confira os campos informados.')
  return result.data
}
function stateOf(state) {
  for (const key of ['professionals', 'slots', 'consultations', 'messages', 'friendships', 'friendMessages', 'companies', 'reviews']) state[key] ||= []
  return state
}
const day = (value) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(new Date(value))
const overlaps = (a, b) => new Date(a.startsAt) < new Date(b.endsAt) && new Date(b.startsAt) < new Date(a.endsAt)
function age(birthDate) {
  const today = day(Date.now())
  return Number(today.slice(0, 4)) - Number(birthDate.slice(0, 4)) - (today.slice(5) < birthDate.slice(5) ? 1 : 0)
}
function participant(state, id, userId) {
  const item = state.consultations.find((c) => c.id === id)
  if (!item || ![item.patientId, item.professionalId].includes(userId)) fail(404, 'Consulta não encontrada.')
  return item
}

export function registerCommunityRoutes(app, { repository, authenticate }) {
  const read = async () => stateOf(await repository.readCommunity())
  const mutate = (fn) => repository.mutateCommunity((state) => fn(stateOf(state)))
  const role = async (id) => (await repository.getRecord(id, 'internal:role'))?.value || 'patient'
  const route = (method, path, action) => app[method](`/v1/community${path}`, authenticate, async (req, res, next) => {
    try { res.json(await action(req)) } catch (error) {
      if (error.status) return res.status(error.status).json({ error: { code: 'COMMUNITY_ERROR', message: error.message } })
      return next(error)
    }
  })
  const admin = async (req) => { if (await role(req.user.id) !== 'admin') fail(403, 'Acesso exclusivo da administração.') }

  route('get', '/me', async (req) => ({ role: await role(req.user.id), professional: (await read()).professionals.find((p) => p.userId === req.user.id) || null }))

  route('get', '/friends', async (req) => {
    const state = await read()
    const users = await repository.listUsers()
    const ids = state.friendships.filter((f) => f.users.includes(req.user.id)).flatMap((f) => f.users).filter((id) => id !== req.user.id)
    const eligible = []
    for (const user of users) if (user.id !== req.user.id && !state.professionals.some((p) => p.userId === user.id) && await role(user.id) !== 'admin') eligible.push(user)
    return { friends: eligible.filter((u) => ids.includes(u.id)), suggestions: eligible.filter((u) => !ids.includes(u.id)).slice(0, 30) }
  })
  route('post', '/friends', async (req) => {
    const { userId } = parse(z.object({ userId: z.uuid() }).strict(), req.body)
    if (userId === req.user.id || !await repository.findUserById(userId) || await role(userId) === 'admin') fail(422, 'Perfil indisponível.')
    return mutate((state) => {
      if (state.professionals.some((p) => p.userId === userId)) fail(422, 'Use a página de psicologia para falar com esse profissional.')
      if (!state.friendships.some((f) => f.users.includes(userId) && f.users.includes(req.user.id))) state.friendships.push({ id: crypto.randomUUID(), users: [req.user.id, userId], createdAt: new Date().toISOString() })
      return { added: true }
    })
  })

  function friendship(state, userId, friendId) {
    const match = state.friendships.find((f) => f.users.includes(userId) && f.users.includes(friendId) && userId !== friendId)
    if (!match) fail(404, 'Adicione essa pessoa à sua rede antes de conversar.')
    return match
  }
  app.use('/v1/community/friends/:id/messages', rateLimit({ windowMs: 60000, limit: 90, standardHeaders: 'draft-8', legacyHeaders: false }))
  route('get', '/friends/:id/messages', async (req) => {
    const state = await read()
    const match = friendship(state, req.user.id, req.params.id)
    return { messages: state.friendMessages.filter((m) => m.friendshipId === match.id).slice(-500) }
  })
  route('post', '/friends/:id/messages', async (req) => {
    const data = parse(messageSchema, req.body)
    return mutate((state) => {
      const match = friendship(state, req.user.id, req.params.id)
      const previous = state.friendMessages.find((m) => m.friendshipId === match.id && m.senderId === req.user.id && m.clientId === data.clientId)
      if (previous) return previous
      const message = { ...data, id: crypto.randomUUID(), friendshipId: match.id, senderId: req.user.id, createdAt: new Date().toISOString() }
      state.friendMessages.push(message)
      return message
    })
  })

  route('post', '/companies', async (req) => {
    const data = parse(companySchema, req.body)
    return mutate((state) => {
      if (state.companies.some((c) => c.cnpj === data.cnpj)) fail(409, 'Já existe uma empresa cadastrada com este CNPJ.')
      const company = { ...data, id: crypto.randomUUID(), ownerId: req.user.id, status: 'pending', createdAt: new Date().toISOString() }
      state.companies.push(company)
      return company
    })
  })
  route('get', '/companies', async (req) => ({ companies: (await read()).companies.filter((c) => c.ownerId === req.user.id) }))

  route('put', '/professional', async (req) => {
    const data = parse(profileSchema, req.body)
    if (age(data.birthDate) < 18 || age(data.birthDate) > 100) fail(422, 'Informe a data de nascimento de um profissional adulto.')
    return mutate((state) => {
      const previous = state.professionals.find((p) => p.userId === req.user.id)
      const profile = { ...data, userId: req.user.id, status: 'pending', updatedAt: new Date().toISOString(), reason: '' }
      if (previous) Object.assign(previous, profile)
      else state.professionals.push(profile)
      return { professional: profile }
    })
  })
  route('get', '/professionals', async () => {
    const users = await repository.listUsers()
    return { professionals: (await read()).professionals.filter((p) => p.status === 'approved').map(({ birthDate, ...p }) => ({ ...p, age: age(birthDate), name: users.find((u) => u.id === p.userId)?.name || 'Profissional', avatarImage: users.find((u) => u.id === p.userId)?.avatarImage || '' })) }
  })
  route('get', '/admin', async (req) => {
    await admin(req)
    const state = await read()
    const users = await repository.listUsers()
    return { companies: state.companies, professionals: state.professionals.map((p) => ({ ...p, name: users.find((u) => u.id === p.userId)?.name || 'Profissional' })), reviews: state.reviews }
  })
  route('put', '/admin/:kind/:id', async (req) => {
    await admin(req)
    const data = parse(reviewSchema, req.body)
    if (data.status === 'rejected' && !data.reason) fail(422, 'Informe a justificativa da rejeição.')
    return mutate((state) => {
      const collection = req.params.kind === 'companies' ? state.companies : req.params.kind === 'professionals' ? state.professionals : []
      const item = collection.find((c) => (c.id || c.userId) === req.params.id)
      if (!item) fail(404, 'Cadastro não encontrado.')
      const review = { ...data, reviewedBy: req.user.id, reviewedAt: new Date().toISOString() }
      Object.assign(item, review)
      state.reviews.push({ ...review, kind: req.params.kind, targetId: req.params.id })
      return item
    })
  })

  route('get', '/slots/:professionalId', async (req) => {
    const state = await read()
    const own = req.params.professionalId === req.user.id
    const profile = state.professionals.find((p) => p.userId === req.params.professionalId)
    if (!profile || (!own && profile.status !== 'approved')) fail(404, 'Profissional indisponível.')
    return { slots: state.slots.filter((s) => s.professionalId === profile.userId && new Date(s.startsAt) > new Date() && !state.consultations.some((c) => c.slotId === s.id && c.status === 'confirmed')).sort((a, b) => a.startsAt.localeCompare(b.startsAt)) }
  })
  route('post', '/slots', async (req) => {
    const data = parse(slotSchema, req.body)
    const startsAt = new Date(data.startsAt)
    if (startsAt <= new Date()) fail(422, 'Escolha um horário futuro.')
    const slot = { id: crypto.randomUUID(), professionalId: req.user.id, startsAt: startsAt.toISOString(), endsAt: new Date(startsAt.getTime() + data.duration * 60000).toISOString() }
    return mutate((state) => {
      if (!state.professionals.some((p) => p.userId === req.user.id && p.status === 'approved')) fail(403, 'Seu perfil precisa ser aprovado para publicar horários.')
      if (state.slots.some((s) => s.professionalId === req.user.id && overlaps(s, slot))) fail(409, 'Este período já está na sua agenda.')
      if (state.consultations.some((c) => c.status === 'confirmed' && [c.patientId, c.professionalId].includes(req.user.id) && overlaps(c, slot))) fail(409, 'Você já tem uma consulta nesse período.')
      state.slots.push(slot)
      return slot
    })
  })
  route('post', '/consultations', async (req) => {
    const { slotId } = parse(z.object({ slotId: z.uuid() }).strict(), req.body)
    return mutate((state) => {
      const slot = state.slots.find((s) => s.id === slotId)
      if (!slot || !state.professionals.some((p) => p.userId === slot.professionalId && p.status === 'approved') || new Date(slot.startsAt) <= new Date()) fail(422, 'Horário indisponível.')
      if (slot.professionalId === req.user.id) fail(422, 'Não é possível agendar consigo mesmo.')
      if (state.consultations.some((c) => c.status === 'confirmed' && (c.slotId === slotId || ([c.patientId, c.professionalId].some((id) => [req.user.id, slot.professionalId].includes(id)) && overlaps(c, slot))))) fail(409, 'Este horário já foi reservado ou conflita com sua agenda.')
      const consultation = { ...slot, id: crypto.randomUUID(), slotId, patientId: req.user.id, status: 'confirmed', createdAt: new Date().toISOString(), meetUrl: '' }
      state.consultations.push(consultation)
      return { id: consultation.id, status: consultation.status }
    })
  })
  route('get', '/consultations', async (req) => {
    const users = await repository.listUsers()
    return { consultations: (await read()).consultations.filter((c) => [c.patientId, c.professionalId].includes(req.user.id)).map((c) => {
      const canJoin = c.status === 'confirmed' && Boolean(c.meetUrl) && day(c.startsAt) === day(Date.now()) && new Date(c.endsAt) > new Date()
      return { ...c, meetUrl: canJoin || c.professionalId === req.user.id ? c.meetUrl : '', canJoin, professionalName: users.find((u) => u.id === c.professionalId)?.name || 'Psicólogo', patientName: users.find((u) => u.id === c.patientId)?.name || 'Paciente' }
    }).sort((a, b) => a.startsAt.localeCompare(b.startsAt)) }
  })
  route('put', '/consultations/:id/meet', async (req) => {
    const { meetUrl } = parse(z.object({ meetUrl: z.string().regex(/^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/) }).strict(), req.body)
    return mutate((state) => {
      const consultation = participant(state, req.params.id, req.user.id)
      if (consultation.professionalId !== req.user.id) fail(403, 'Apenas o profissional pode informar o link da reunião.')
      consultation.meetUrl = meetUrl
      return { saved: true }
    })
  })
  app.use('/v1/community/consultations/:id/messages', rateLimit({ windowMs: 60000, limit: 90, standardHeaders: 'draft-8', legacyHeaders: false }))
  route('get', '/consultations/:id/messages', async (req) => {
    const state = await read()
    participant(state, req.params.id, req.user.id)
    return { messages: state.messages.filter((m) => m.consultationId === req.params.id).slice(-500) }
  })
  route('post', '/consultations/:id/messages', async (req) => {
    const data = parse(messageSchema, req.body)
    return mutate((state) => {
      participant(state, req.params.id, req.user.id)
      const previous = state.messages.find((m) => m.senderId === req.user.id && m.consultationId === req.params.id && m.clientId === data.clientId)
      if (previous) return previous
      const message = { ...data, id: crypto.randomUUID(), consultationId: req.params.id, senderId: req.user.id, createdAt: new Date().toISOString() }
      state.messages.push(message)
      return message
    })
  })
}
