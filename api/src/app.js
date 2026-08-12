import bcrypt from 'bcryptjs'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const allowedDataKeys = new Set([
  'mamabloom:appointments',
  'mamabloom:bloomie-chat',
  'mamabloom:cart',
  'mamabloom:diary',
  'mamabloom:diary-reminder',
  'mamabloom:emergency-card',
  'mamabloom:health-checks',
  'mamabloom:institutional-requests',
  'mamabloom:selected-plan',
  'mamabloom:shop-favorites',
  'mamabloom:support-favorites',
])

const isoDate = /^\d{4}-\d{2}-\d{2}$/

function isValidDate(value) {
  if (!isoDate.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function ageOnDate(birthDate, reference = new Date()) {
  const birth = new Date(`${birthDate}T00:00:00Z`)
  let age = reference.getUTCFullYear() - birth.getUTCFullYear()
  const beforeBirthday =
    reference.getUTCMonth() < birth.getUTCMonth() ||
    (reference.getUTCMonth() === birth.getUTCMonth() && reference.getUTCDate() < birth.getUTCDate())
  if (beforeBirthday) age -= 1
  return age
}

const registrationSchema = z.object({
  name: z.string().trim().min(3).max(120),
  email: z.email().transform((value) => value.toLowerCase()),
  cpf: z.string().transform((value) => value.replace(/\D/g, '')).pipe(z.string().length(11)),
  birthDate: z.string().refine(isValidDate, 'Data de nascimento inválida.'),
  password: z.string().min(6).max(128),
}).refine((data) => ageOnDate(data.birthDate) >= 16, {
  path: ['birthDate'],
  message: 'O MamaBloom é destinado a pessoas com 16 anos ou mais.',
})

const loginSchema = z.object({
  identity: z.string().trim().min(1).max(160),
  password: z.string().min(1).max(128),
})

const pregnancySchema = z.object({
  lastPeriod: z.string().refine(isValidDate, 'Data da última menstruação inválida.'),
  weeks: z.number().int().min(0).max(42),
}).refine((data) => new Date(`${data.lastPeriod}T00:00:00Z`) <= new Date(), {
  path: ['lastPeriod'],
  message: 'A data da última menstruação não pode estar no futuro.',
})

const dataSchema = z.object({ value: z.json() })

function normalizeIdentity(identity) {
  return identity.includes('@') ? identity.toLowerCase() : identity.replace(/\D/g, '')
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    birthDate: user.birthDate,
    pregnancy: user.pregnancy ?? null,
    createdAt: user.createdAt,
  }
}

function errorBody(code, message, fields) {
  return { error: { code, message, ...(fields ? { fields } : {}) } }
}

function validationFields(error) {
  return Object.fromEntries(error.issues.map((issue) => [issue.path.join('.') || 'form', issue.message]))
}

export function createApp({ repository, config }) {
  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', 1)
  app.use(helmet())
  app.use(cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) return callback(null, true)
      return callback(new Error('Origem não permitida.'))
    },
  }))
  app.use(express.json({ limit: '1mb' }))
  app.use(cookieParser())

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  })

  function createToken(user) {
    return jwt.sign({ sub: user.id }, config.jwtSecret, { expiresIn: '7d', issuer: 'mamabloom-api' })
  }

  const cookieOptions = {
    httpOnly: true,
    sameSite: config.secureCookies ? 'none' : 'lax',
    secure: Boolean(config.secureCookies),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  }

  function startSession(res, user) {
    res.cookie(config.sessionCookieName || 'mamabloom_session', createToken(user), cookieOptions)
    return { user: publicUser(user) }
  }

  async function authenticate(req, res, next) {
    const [scheme, bearerToken] = (req.get('Authorization') ?? '').split(' ')
    const token = scheme === 'Bearer' ? bearerToken : req.cookies[config.sessionCookieName || 'mamabloom_session']
    if (!token) {
      return res.status(401).json(errorBody('AUTH_REQUIRED', 'Faça login para continuar.'))
    }

    try {
      const payload = jwt.verify(token, config.jwtSecret, { issuer: 'mamabloom-api' })
      const user = await repository.findUserById(payload.sub)
      if (!user) return res.status(401).json(errorBody('INVALID_SESSION', 'Sessão inválida.'))
      req.user = user
      return next()
    } catch {
      return res.status(401).json(errorBody('INVALID_SESSION', 'Sua sessão expirou ou é inválida.'))
    }
  }

  app.get('/health', (_req, res) => res.json({ status: 'ok' }))

  app.post('/v1/auth/register', authLimiter, async (req, res, next) => {
    const parsed = registrationSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(422).json(errorBody('VALIDATION_ERROR', 'Confira os dados informados.', validationFields(parsed.error)))
    }

    try {
      const existingEmail = await repository.findUserByIdentity(parsed.data.email)
      const existingCpf = await repository.findUserByIdentity(parsed.data.cpf)
      if (existingEmail || existingCpf) {
        return res.status(409).json(errorBody('ACCOUNT_EXISTS', 'Já existe uma conta com este e-mail ou CPF.'))
      }

      const passwordHash = await bcrypt.hash(parsed.data.password, config.bcryptRounds)
      const user = await repository.createUser({
        name: parsed.data.name,
        email: parsed.data.email,
        cpf: parsed.data.cpf,
        birthDate: parsed.data.birthDate,
        passwordHash,
      })
      return res.status(201).json(startSession(res, user))
    } catch (error) {
      return next(error)
    }
  })

  app.post('/v1/auth/login', authLimiter, async (req, res, next) => {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(422).json(errorBody('VALIDATION_ERROR', 'Informe identidade e senha válidas.'))
    }

    try {
      const user = await repository.findUserByIdentity(normalizeIdentity(parsed.data.identity))
      if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
        return res.status(401).json(errorBody('INVALID_CREDENTIALS', 'E-mail, CPF ou senha incorretos.'))
      }
      return res.json(startSession(res, user))
    } catch (error) {
      return next(error)
    }
  })

  app.get('/v1/auth/me', authenticate, (req, res) => res.json({ user: publicUser(req.user) }))

  app.post('/v1/auth/logout', (_req, res) => {
    res.clearCookie(config.sessionCookieName || 'mamabloom_session', {
      httpOnly: true,
      sameSite: config.secureCookies ? 'none' : 'lax',
      secure: Boolean(config.secureCookies),
      path: '/',
    })
    return res.status(204).end()
  })

  app.put('/v1/auth/pregnancy', authenticate, async (req, res, next) => {
    const parsed = pregnancySchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(422).json(errorBody('VALIDATION_ERROR', 'Confira os dados da gestação.', validationFields(parsed.error)))
    }

    try {
      const user = await repository.updatePregnancy(req.user.id, parsed.data)
      return res.json({ user: publicUser(user) })
    } catch (error) {
      return next(error)
    }
  })

  app.get('/v1/data/:key', authenticate, async (req, res, next) => {
    if (!allowedDataKeys.has(req.params.key)) {
      return res.status(422).json(errorBody('INVALID_DATA_KEY', 'Módulo de dados não reconhecido.'))
    }

    try {
      const record = await repository.getRecord(req.user.id, req.params.key)
      if (!record) return res.status(404).json(errorBody('DATA_NOT_FOUND', 'Ainda não há dados salvos para este módulo.'))
      return res.json(record)
    } catch (error) {
      return next(error)
    }
  })

  app.put('/v1/data/:key', authenticate, async (req, res, next) => {
    if (!allowedDataKeys.has(req.params.key)) {
      return res.status(422).json(errorBody('INVALID_DATA_KEY', 'Módulo de dados não reconhecido.'))
    }
    const parsed = dataSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(422).json(errorBody('VALIDATION_ERROR', 'O valor enviado não é um JSON válido.'))
    }

    try {
      const record = await repository.setRecord(req.user.id, req.params.key, parsed.data.value)
      return res.json(record)
    } catch (error) {
      return next(error)
    }
  })

  app.use((_req, res) => res.status(404).json(errorBody('NOT_FOUND', 'Rota não encontrada.')))
  app.use((error, _req, res, _next) => {
    if (error instanceof SyntaxError && 'body' in error) {
      return res.status(400).json(errorBody('INVALID_JSON', 'O corpo da requisição não contém JSON válido.'))
    }
    if (error.message === 'Origem não permitida.') {
      return res.status(403).json(errorBody('ORIGIN_NOT_ALLOWED', error.message))
    }
    if (error.code === '23505') {
      return res.status(409).json(errorBody('ACCOUNT_EXISTS', 'Já existe uma conta com este e-mail ou CPF.'))
    }
    console.error(error)
    return res.status(500).json(errorBody('INTERNAL_ERROR', 'Não foi possível concluir a operação.'))
  })

  return app
}
