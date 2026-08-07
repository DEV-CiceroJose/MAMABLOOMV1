import { useMemo, useState } from 'react'
import { AuthContext } from './auth-context.js'

const SESSION_KEY = 'mamabloom:session'
const DRAFT_KEY = 'mamabloom:registration-draft'

function readStoredJson(key) {
  try {
    return JSON.parse(window.localStorage.getItem(key))
  } catch {
    return null
  }
}

function readDraft() {
  try {
    return JSON.parse(window.sessionStorage.getItem(DRAFT_KEY))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredJson(SESSION_KEY))

  const value = useMemo(
    () => ({
      user,
      login(identity) {
        const session = {
          name: identity.includes('@') ? 'Maria' : 'Mamãe',
          identity,
          createdAt: new Date().toISOString(),
        }
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
        setUser(session)
      },
      saveRegistrationDraft(data) {
        window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(data))
      },
      finishRegistration(pregnancyData) {
        const draft = readDraft() ?? {}
        const session = {
          name: draft.name?.split(' ')[0] || 'Mamãe',
          identity: draft.email || draft.cpf || 'cadastro-local',
          pregnancy: pregnancyData,
          createdAt: new Date().toISOString(),
        }
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
        window.sessionStorage.removeItem(DRAFT_KEY)
        setUser(session)
      },
      logout() {
        window.localStorage.removeItem(SESSION_KEY)
        setUser(null)
      },
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
