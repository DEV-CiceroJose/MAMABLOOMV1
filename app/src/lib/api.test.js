import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, authApi, dataApi, storeSession } from './api.js'

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('cliente da API', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('envia identidade e senha no login sem token antigo', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      user: { id: 'user-1', name: 'Ana' },
    }))
    vi.stubGlobal('fetch', fetchMock)

    await authApi.login('ana@example.com', 'segura123')

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/v1/auth/login',
      expect.objectContaining({
        method: 'POST',
        headers: expect.not.objectContaining({ Authorization: expect.anything() }),
        credentials: 'include',
        body: JSON.stringify({ identity: 'ana@example.com', password: 'segura123' }),
      }),
    )
  })

  it('usa cookie HttpOnly ao sincronizar um módulo', async () => {
    storeSession({ user: { id: 'user-1', name: 'Ana' } })
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ key: 'mamabloom:diary', value: [] }))
    vi.stubGlobal('fetch', fetchMock)

    await dataApi.get('mamabloom:diary')

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/v1/data/mamabloom%3Adiary',
      expect.objectContaining({
        credentials: 'include',
        headers: expect.not.objectContaining({ Authorization: expect.anything() }),
      }),
    )
  })

  it('preserva código, status e campos dos erros da API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Confira os dados informados.',
        fields: { email: 'E-mail inválido.' },
      },
    }, 422)))

    await expect(authApi.register({})).rejects.toMatchObject({
      name: 'ApiError',
      code: 'VALIDATION_ERROR',
      status: 422,
      fields: { email: 'E-mail inválido.' },
    })
    await expect(authApi.register({})).rejects.toBeInstanceOf(ApiError)
  })
})
