import { useEffect, useState } from 'react'
import { fetchPokemon } from '../api/pokemon.js'

export default function usePokemonList() {
  const [pokemonList, setPokemonList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loadedCount, setLoadedCount] = useState(0)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadPokemon() {
      setLoading(true)
      setError('')
      setLoadedCount(0)
      setPokemonList([])

      try {
        const collected = []
        for (let id = 1; id <= 10; id += 1) {
          const pokemon = await fetchPokemon(id, controller.signal)
          if (controller.signal.aborted) return
          collected.push(pokemon)
          setLoadedCount(collected.length)
        }
        setPokemonList(collected)
      } catch (error) {
        if (!controller.signal.aborted) {
          setError('データを読み込めませんでした。接続を確認して再試行してください。')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadPokemon()
    return () => controller.abort()
  }, [attempt])

  function retry() {
    setAttempt((previous) => previous + 1)
  }

  return { pokemonList, loading, error, loadedCount, retry }
}
