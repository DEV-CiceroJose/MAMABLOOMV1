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
