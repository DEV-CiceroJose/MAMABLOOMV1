import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError, dataApi } from '../lib/api.js'
import { useAuth } from './useAuth.js'

function resolveInitial(initialValue) {
  return typeof initialValue === 'function' ? initialValue() : initialValue
}

function readValue(key, initialValue) {
  try {
    const stored = window.localStorage.getItem(key)
    return stored === null ? resolveInitial(initialValue) : JSON.parse(stored)
  } catch {
    return resolveInitial(initialValue)
  }
}

export function scopedStorageKey(userId, key) {
  const moduleName = key.startsWith('mamabloom:') ? key.slice('mamabloom:'.length) : key
  return `mamabloom:user:${userId}:${moduleName}`
}

export function useLocalData(key, initialValue) {
  const { user } = useAuth()
  const userId = user?.id
  const storageKey = scopedStorageKey(userId, key)
  const initialValueRef = useRef(initialValue)
  const [value, setValue] = useState(() => readValue(storageKey, initialValueRef.current))
  const valueRef = useRef(value)
  const revisionRef = useRef(0)

  useEffect(() => {
    const scopedValue = readValue(storageKey, initialValueRef.current)
    revisionRef.current = 0
    valueRef.current = scopedValue
    setValue(scopedValue)
  }, [storageKey])

  useEffect(() => {
    valueRef.current = value
  }, [value])

  useEffect(() => {
    if (!userId) return undefined
    let active = true
    const startingRevision = revisionRef.current

    async function synchronize() {
      try {
        const remote = await dataApi.get(key)
        if (!active) return
        if (revisionRef.current !== startingRevision) {
          await dataApi.set(key, valueRef.current)
          return
        }
        window.localStorage.setItem(storageKey, JSON.stringify(remote.value))
        valueRef.current = remote.value
        setValue(remote.value)
      } catch (error) {
        if (!active) return
        if (error instanceof ApiError && error.status === 404) {
          await dataApi.set(key, valueRef.current).catch(() => undefined)
        }
      }
    }

    void synchronize()
    const syncWhenOnline = () => { void dataApi.set(key, valueRef.current).catch(() => undefined) }
    window.addEventListener('online', syncWhenOnline)
    return () => {
      active = false
      window.removeEventListener('online', syncWhenOnline)
    }
  }, [key, storageKey, userId])

  const updateValue = useCallback(
    (nextValue) => {
      setValue((current) => {
        const resolved = typeof nextValue === 'function' ? nextValue(current) : nextValue
        revisionRef.current += 1
        valueRef.current = resolved
        window.localStorage.setItem(storageKey, JSON.stringify(resolved))
        if (userId) void dataApi.set(key, resolved).catch(() => undefined)
        return resolved
      })
    },
    [key, storageKey, userId],
  )

  return [value, updateValue]
}
