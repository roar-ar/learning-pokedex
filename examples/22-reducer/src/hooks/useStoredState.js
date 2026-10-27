import { useEffect, useState } from 'react'
import { readStoredValue, writeStoredValue } from '../utils/storage.js'

export default function useStoredState(key, initialValue, isValid) {
  const [value, setValue] = useState(() => readStoredValue(key, initialValue, isValid))

  useEffect(() => {
    writeStoredValue(key, value)
  }, [key, value])

  return [value, setValue]
}
