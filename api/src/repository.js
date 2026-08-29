import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

function mapUser(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    cpf: row.cpf,
    birthDate: row.birth_date instanceof Date ? row.birth_date.toISOString().slice(0, 10) : row.birth_date,
    passwordHash: row.password_hash,
    pregnancy: row.pregnancy,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }
}

function emptyJsonStore() {
  return { version: 1, users: [], records: {} }
}

function validateJsonStore(data) {
  const valid = data
    && data.version === 1
    && Array.isArray(data.users)
    && data.records
    && typeof data.records === 'object'
    && !Array.isArray(data.records)

  if (!valid) throw new Error('O arquivo de dados JSON do MamaBloom é inválido.')
  return data
}

function clone(value) {
  return value === undefined ? undefined : structuredClone(value)
}

export class JsonFileRepository {
  constructor(filePath) {
    if (!filePath) throw new Error('O caminho do arquivo JSON é obrigatório.')
    this.filePath = filePath
    this.data = null
    this.initializing = null
    this.writeQueue = Promise.resolve()
  }

  async initialize() {
    await this.#ensureInitialized()
    return this
  }

  async #ensureInitialized() {
    if (this.data) return
    if (!this.initializing) {
      this.initializing = (async () => {
        try {
          const contents = await readFile(this.filePath, 'utf8')
          this.data = validateJsonStore(JSON.parse(contents))
        } catch (error) {
          if (error.code !== 'ENOENT') throw error
          this.data = emptyJsonStore()
          await this.#persist()
        }
      })()
    }
    await this.initializing
  }

  async #persist() {
    await mkdir(dirname(this.filePath), { recursive: true })
    const temporaryPath = `${this.filePath}.${process.pid}.${crypto.randomUUID()}.tmp`
    try {
      await writeFile(temporaryPath, `${JSON.stringify(this.data, null, 2)}\n`, { mode: 0o600 })
      await rename(temporaryPath, this.filePath)
    } catch (error) {
      await unlink(temporaryPath).catch(() => {})
      throw error
    }
  }

  async #read(operation) {
    await this.writeQueue.catch(() => {})
    await this.#ensureInitialized()
    return clone(operation(this.data))
  }

  async #mutate(operation) {
    let result
    const queuedWrite = this.writeQueue.catch(() => {}).then(async () => {
      await this.#ensureInitialized()
      const previousData = clone(this.data)
      result = operation(this.data)
      try {
        await this.#persist()
      } catch (error) {
        this.data = previousData
        throw error
      }
    })
    this.writeQueue = queuedWrite
    await queuedWrite
    return clone(result)
  }

  async createUser(input) {
    return this.#mutate((data) => {
      const now = new Date().toISOString()
      const user = {
        id: crypto.randomUUID(),
        name: input.name,
        email: input.email,
        cpf: input.cpf,
        birthDate: input.birthDate,
        passwordHash: input.passwordHash,
        pregnancy: null,
        createdAt: now,
        updatedAt: now,
      }
      data.users.push(user)
      return user
    })
  }

  async findUserByIdentity(identity) {
    return this.#read((data) => data.users.find((user) => user.email === identity || user.cpf === identity) ?? null)
  }

  async findUserById(id) {
    return this.#read((data) => data.users.find((user) => user.id === id) ?? null)
  }

  async updatePregnancy(userId, pregnancy) {
    return this.#mutate((data) => {
      const user = data.users.find((candidate) => candidate.id === userId)
      if (!user) return null
      user.pregnancy = pregnancy
      user.updatedAt = new Date().toISOString()
      return user
    })
  }

  async getRecord(userId, key) {
    return this.#read((data) => data.records[`${userId}:${key}`] ?? null)
  }

  async setRecord(userId, key, value) {
    return this.#mutate((data) => {
      const record = { key, value, updatedAt: new Date().toISOString() }
      data.records[`${userId}:${key}`] = record
      return record
    })
  }
}

export class PostgresRepository {
  constructor(pool) {
    this.pool = pool
  }

  async createUser(input) {
    const { rows } = await this.pool.query(
      `INSERT INTO users (id, name, email, cpf, birth_date, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [crypto.randomUUID(), input.name, input.email, input.cpf, input.birthDate, input.passwordHash],
    )
    return mapUser(rows[0])
  }

  async findUserByIdentity(identity) {
    const { rows } = await this.pool.query(
      'SELECT * FROM users WHERE email = $1 OR cpf = $1 LIMIT 1',
      [identity],
    )
    return mapUser(rows[0])
  }

  async findUserById(id) {
    const { rows } = await this.pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id])
    return mapUser(rows[0])
  }

  async updatePregnancy(userId, pregnancy) {
    const { rows } = await this.pool.query(
      `UPDATE users
       SET pregnancy = $2::jsonb, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [userId, JSON.stringify(pregnancy)],
    )
    return mapUser(rows[0])
  }

  async getRecord(userId, key) {
    const { rows } = await this.pool.query(
      `SELECT data_key AS key, value, updated_at AS "updatedAt"
       FROM user_data
       WHERE user_id = $1 AND data_key = $2`,
      [userId, key],
    )
    return rows[0] ?? null
  }

  async setRecord(userId, key, value) {
    const { rows } = await this.pool.query(
      `INSERT INTO user_data (user_id, data_key, value)
       VALUES ($1, $2, $3::jsonb)
       ON CONFLICT (user_id, data_key)
       DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
       RETURNING data_key AS key, value, updated_at AS "updatedAt"`,
      [userId, key, JSON.stringify(value)],
    )
    return rows[0]
  }
}
