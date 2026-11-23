import { useCallback, useEffect, useState } from 'react'
import { communityApi } from '../lib/api.js'

export function useCommunity(path) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const refresh = useCallback(async () => {
    try {
      const result = await communityApi.get(path)
      setData(result)
      setError('')
      return result
    } catch (err) { setError(err.message); return null }
  }, [path])
  useEffect(() => { setData(null); void refresh() }, [refresh])
  return { data, error, refresh }
}
