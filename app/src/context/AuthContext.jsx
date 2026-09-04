import { useEffect, useMemo, useState } from 'react'
import { authApi, clearSession, readSession, storeSession } from '../lib/api.js'
import { AuthContext } from './auth-context.js'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession)
  const [isLoading, setIsLoading] = useState(Boolean(session))
  const userId = session?.user?.id

  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return undefined
    }

    let active = true
    authApi.me()
      .then(({ user }) => {
        if (!active) return
        const verifiedSession = { user }
        storeSession(verifiedSession)
        setSession(verifiedSession)
      })
      .catch(() => {
        if (!active) return
        clearSession()
        setSession(null)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => { active = false }
  }, [userId])

  function applySession(nextSession) {
    storeSession(nextSession)
    setSession(nextSession)
    return nextSession.user
  }

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      isLoading,
      async login(identity, password) {
        return applySession(await authApi.login(identity.trim(), password))
      },
      async register(data) {
        return applySession(await authApi.register(data))
      },
      async updateProfile(data) {
        return applySession(await authApi.updateProfile(data))
      },
      async finishRegistration(pregnancyData) {
        if (!session?.user) throw new Error('Sua sessão de cadastro expirou. Faça o cadastro novamente.')
        const { user } = await authApi.updatePregnancy(pregnancyData)
        return applySession({ user })
      },
      logout() {
        void authApi.logout().catch(() => undefined)
        clearSession()
        setSession(null)
      },
    }),
    [isLoading, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
