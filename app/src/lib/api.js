const SESSION_KEY = 'mamabloom:session'
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, { code = 'API_ERROR', status = 0, fields } = {}) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.fields = fields
  }
}

export function readSession() {
  try {
    const session = JSON.parse(window.localStorage.getItem(SESSION_KEY))
    return session?.user ? session : null
  } catch {
    return null
  }
}

export function storeSession(session) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY)
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      credentials: 'include',
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Não foi possível conectar ao MamaBloom. Confira sua internet e tente novamente.', {
      code: 'NETWORK_ERROR',
    })
  }

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new ApiError(payload.error?.message || 'Não foi possível concluir a operação.', {
      code: payload.error?.code,
      status: response.status,
      fields: payload.error?.fields,
    })
  }
  return payload
}

export const authApi = {
  register(data) {
    return request('/v1/auth/register', { method: 'POST', body: data })
  },
  login(identity, password) {
    return request('/v1/auth/login', { method: 'POST', body: { identity, password } })
  },
  me() {
    return request('/v1/auth/me')
  },
  updatePregnancy(data) {
    return request('/v1/auth/pregnancy', { method: 'PUT', body: data })
  },
  logout() {
    return request('/v1/auth/logout', { method: 'POST' })
  },
}

export const dataApi = {
  get(key) {
    return request(`/v1/data/${encodeURIComponent(key)}`)
  },
  set(key, value) {
    return request(`/v1/data/${encodeURIComponent(key)}`, { method: 'PUT', body: { value } })
  },
}
