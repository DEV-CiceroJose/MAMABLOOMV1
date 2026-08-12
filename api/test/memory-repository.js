export class MemoryRepository {
  constructor() {
    this.users = []
    this.records = new Map()
  }

  async createUser(input) {
    const user = { id: crypto.randomUUID(), pregnancy: null, ...input }
    this.users.push(user)
    return user
  }

  async findUserByIdentity(identity) {
    return this.users.find((user) => user.email === identity || user.cpf === identity) ?? null
  }

  async findUserById(id) {
    return this.users.find((user) => user.id === id) ?? null
  }

  async updatePregnancy(userId, pregnancy) {
    const user = await this.findUserById(userId)
    user.pregnancy = pregnancy
    return user
  }

  async getRecord(userId, key) {
    return this.records.get(`${userId}:${key}`) ?? null
  }

  async setRecord(userId, key, value) {
    const record = { key, value, updatedAt: new Date().toISOString() }
    this.records.set(`${userId}:${key}`, record)
    return record
  }
}
