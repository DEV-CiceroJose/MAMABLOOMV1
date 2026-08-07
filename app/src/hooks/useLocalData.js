import { useCallback, useState } from 'react'

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

export function useLocalData(key, initialValue) {
  const [value, setValue] = useState(() => readValue(key, initialValue))

  const updateValue = useCallback(
    (nextValue) => {
      setValue((current) => {
        const resolved = typeof nextValue === 'function' ? nextValue(current) : nextValue
        window.localStorage.setItem(key, JSON.stringify(resolved))
        return resolved
      })
    },
    [key],
  )

  return [value, updateValue]
}
