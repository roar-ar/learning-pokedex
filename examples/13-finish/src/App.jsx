import { useEffect, useRef, useState } from 'react'
import { fetchPokemon } from './api/pokemon.js'
import PokemonCard from './components/PokemonCard.jsx'
import PokemonDetail from './components/PokemonDetail.jsx'
import FilterControls from './components/FilterControls.jsx'
import typeNames from './data/typeNames.ja.json'

export default function App() {
  const [selectedId, setSelectedId] = useState(null)
  const [query, setQuery] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')
  const dialogRef = useRef(null)
  const [pokemonList, setPokemonList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loadedCount, setLoadedCount] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const [lastSelectedId, setLastSelectedId] = useState(null)
  const returnButtonRef = useRef(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadPokemon() {
      setLoading(true)
      setError('')
      setLoadedCount(0)
      setPokemonList([])
      setSelectedId(null)

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

  useEffect(() => {
    if (selectedId === null && lastSelectedId !== null) {
      returnButtonRef.current?.focus()
    }
  }, [selectedId, lastSelectedId])

  function handleSelect(id) {
    setLastSelectedId(id)
    setSelectedId(id)
  }

  function resetConditions() {
    setQuery('')
    setSelectedType('')
    setSortOrder('asc')
  }

  const normalizedQuery = query.trim().toLowerCase()
  const filteredPokemon = pokemonList.filter((pokemon) => {
    const matchesName = pokemon.name.toLowerCase().includes(normalizedQuery)
    const matchesType = selectedType === '' || pokemon.types.some((entry) => entry.type.name === selectedType)
    return matchesName && matchesType
  })
  const sortedPokemon = [...filteredPokemon].sort((a, b) => (
    sortOrder === 'asc' ? a.id - b.id : b.id - a.id
  ))
  if (loading) {
    return (
      <main>
        <h1>ポケモン図鑑</h1>
        <p role="status">読み込み中… {loadedCount} / 10</p>
      </main>
    )
  }

  if (error) {
    return (
      <main>
        <h1>ポケモン図鑑</h1>
        <p role="alert">{error}</p>
        <button type="button" onClick={() => setAttempt((previous) => previous + 1)}>再試行</button>
      </main>
    )
  }

  const selectedPokemon = pokemonList.find((pokemon) => pokemon.id === selectedId)
  if (selectedPokemon) {
    return (
      <main>
        <h1>ポケモン図鑑</h1>
        <PokemonDetail pokemon={selectedPokemon} onBack={() => setSelectedId(null)} />
      </main>
    )
  }

  return (
    <main>
      <h1>ポケモン図鑑</h1>
      <button type="button" onClick={() => dialogRef.current.showModal()}>検索・並び替え</button>
      <dialog className="filters-dialog" ref={dialogRef} aria-labelledby="filters-title">
        <h2 id="filters-title">検索・並び替えの条件</h2>
        <FilterControls
          query={query}
          onQueryChange={setQuery}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
        />
        <p role="status">{sortedPokemon.length}匹が見つかりました</p>
        <div className="dialog-actions">
          <button type="button" onClick={resetConditions}>条件をリセット</button>
          <button type="button" onClick={() => dialogRef.current.close()}>条件を閉じる</button>
        </div>
      </dialog>
      <p className="current-conditions">
        名前: {query.trim() || '指定なし'} ／ タイプ: {selectedType ? typeNames[selectedType] : 'すべて'} ／ 並び順: {sortOrder === 'asc' ? '小さい順' : '大きい順'}
      </p>
      <p className="result-summary" role="status">{sortedPokemon.length}匹が見つかりました</p>
      {sortedPokemon.length === 0 && <p>条件に一致するポケモンはいません。</p>}
      <div className="pokemon-list">
        {sortedPokemon.map((pokemon) => (
          <PokemonCard
            key={pokemon.id}
            pokemon={pokemon}
            onSelect={handleSelect}
            buttonRef={pokemon.id === lastSelectedId ? returnButtonRef : null}
          />
        ))}
      </div>
    </main>
  )
}
