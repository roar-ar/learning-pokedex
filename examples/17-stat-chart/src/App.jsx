import { useEffect, useRef, useState } from 'react'
import { fetchPokemon } from './api/pokemon.js'
import PokemonCard from './components/PokemonCard.jsx'
import PokemonDetail from './components/PokemonDetail.jsx'
import FilterControls from './components/FilterControls.jsx'
import typeNames from './data/typeNames.ja.json'
import { createDefaultConditions, copyConditions } from './utils/conditions.js'

const PAGE_SIZE = 3

export default function App() {
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(null)
  const [conditions, setConditions] = useState(createDefaultConditions)
  const [draft, setDraft] = useState(createDefaultConditions)
  const { query, selectedTypes, typeMatch, sortOrder } = conditions
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

  function openFilters() {
    setDraft(copyConditions(conditions))
    dialogRef.current.showModal()
  }

  function toggleType(type) {
    setDraft((previous) => ({
      ...previous,
      selectedTypes: previous.selectedTypes.includes(type)
        ? previous.selectedTypes.filter((value) => value !== type)
        : [...previous.selectedTypes, type],
    }))
  }

  function applyFilters() {
    setConditions(copyConditions(draft))
    setPage(1)
    dialogRef.current.close()
  }

  function cancelFilters() {
    setDraft(copyConditions(conditions))
    dialogRef.current.close()
  }

  function resetConditions() {
    setDraft(createDefaultConditions())
  }

  const normalizedQuery = query.trim().toLowerCase()
  const filteredPokemon = pokemonList.filter((pokemon) => {
    const matchesName = pokemon.name.toLowerCase().includes(normalizedQuery)
    const matchesSelectedTypes = typeMatch === 'all'
      ? selectedTypes.every((type) => pokemon.types.some((entry) => entry.type.name === type))
      : selectedTypes.some((type) => pokemon.types.some((entry) => entry.type.name === type))
    const matchesType = selectedTypes.length === 0 || matchesSelectedTypes
    return matchesName && matchesType
  })
  const sortedPokemon = [...filteredPokemon].sort((a, b) => (
    sortOrder === 'asc' ? a.id - b.id : b.id - a.id
  ))
  const pageCount = Math.ceil(sortedPokemon.length / PAGE_SIZE)
  const currentPage = Math.min(page, Math.max(1, pageCount))
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const visiblePokemon = sortedPokemon.slice(startIndex, startIndex + PAGE_SIZE)

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
      <button type="button" onClick={openFilters}>検索・並び替え</button>
      <dialog className="filters-dialog" ref={dialogRef} aria-labelledby="filters-title" onCancel={() => setDraft(copyConditions(conditions))}>
        <h2 id="filters-title">検索・並び替えの条件</h2>
        <FilterControls
          query={draft.query}
          onQueryChange={(value) => setDraft((previous) => ({ ...previous, query: value }))}
          selectedTypes={draft.selectedTypes}
          onTypeToggle={toggleType}
          typeMatch={draft.typeMatch}
          onTypeMatchChange={(value) => setDraft((previous) => ({ ...previous, typeMatch: value }))}
          sortOrder={draft.sortOrder}
          onSortChange={(value) => setDraft((previous) => ({ ...previous, sortOrder: value }))}
        />
        <p>「適用」を押すと一覧に反映されます。</p>
        <div className="dialog-actions">
          <button type="button" onClick={resetConditions}>条件をリセット</button>
          <button type="button" onClick={cancelFilters}>キャンセル</button>
          <button type="button" onClick={applyFilters}>適用</button>
        </div>
      </dialog>
      <p className="current-conditions">
        名前: {query.trim() || '指定なし'} ／ タイプ: {selectedTypes.length === 0 ? 'すべて' : selectedTypes.map((type) => typeNames[type]).join(' / ')} ／ 一致: {typeMatch === 'all' ? 'すべて' : 'いずれか'} ／ 並び順: {sortOrder === 'asc' ? '小さい順' : '大きい順'}
      </p>
      <p className="result-summary" role="status">{sortedPokemon.length}匹が見つかりました</p>
      {sortedPokemon.length === 0 && <p>条件に一致するポケモンはいません。</p>}
      {pageCount > 0 && (
        <nav className="pagination" aria-label="一覧のページ">
          <button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>前へ</button>
          <p role="status">{currentPage} / {pageCount} ページ</p>
          <button type="button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>次へ</button>
        </nav>
      )}
      <div className="pokemon-list">
        {visiblePokemon.map((pokemon) => (
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
