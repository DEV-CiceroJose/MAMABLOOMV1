import { createContext } from 'react'

export const AccessContext = createContext({ role: 'patient' })

export function accountArea(access) {
  if (access?.role === 'admin') return 'admin'
  if (access?.role === 'professional' || access?.professional) return 'professional'
  return 'patient'
}
