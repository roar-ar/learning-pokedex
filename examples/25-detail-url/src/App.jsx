import { useEffect, useReducer, useRef, useState } from 'react'
import usePokemonList from './hooks/usePokemonList.js'
import PokemonCard from './components/PokemonCard.jsx'
import PokemonDetail from './components/PokemonDetail.jsx'
import FilterControls from './components/FilterControls.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import FavoritesSummary from './components/FavoritesSummary.jsx'
import Modal from './components/Modal.jsx'
import typeNames from './data/typeNames.ja.json'
import { catalogReducer } from './state/catalogReducer.js'
import { readCatalogUrl } from './utils/catalogUrl.js'
import useCatalogUrl from './hooks/useCatalogUrl.js'
import useDetailUrl from './hooks/useDetailUrl.js'

const PAGE_SIZE = 3

export default function App() {
  const { selectedId, detailError, openDetail, closeDetail } = useDetailUrl()
  const [catalog, dispatch] = useReducer(catalogReducer, undefined, readCatalogUrl)
  const { conditions, draft, page } = catalog
  const { query, selectedTypes, typeMatch, sortOrder } = conditions
  const dialogRef = useRef(null)
  const { pokemonList, loading, error, loadedCount, retry } = usePokemonList()
  const [lastSelectedId, setLastSelectedId] = useState(null)
  const returnButtonRef = useRef(null)

  useEffect(() => {
    if (selectedId === null && lastSelectedId !== null) {
      returnButtonRef.current?.focus()
    }
  }, [selectedId, lastSelectedId])

  function handleSelect(id) {
    setLastSelectedId(id)
    openDetail(id)
  }

  function openFilters() {
    dispatch({ type: 'filters_opened' })
    dialogRef.current.showModal()
  }

  function toggleType(type) {
    dispatch({ type: 'type_toggled', value: type })
  }

  function applyFilters() {
    commit({ type: 'filters_applied' })
    dialogRef.current.close()
  }

  function cancelFilters() {
    dispatch({ type: 'filters_cancelled' })
    dialogRef.current.close()
  }

  function resetConditions() {
    dispatch({ type: 'draft_reset' })
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

  const commit = useCatalogUrl({ catalog, dispatch, currentPage, loading, error, dialogRef })

  if (loading) {
    return (
      <main>
        <h1>ポケモン図鑑</h1>
        <ThemeToggle />
        <FavoritesSummary />
        <p role="status">読み込み中… {loadedCount} / 10</p>
      </main>
    )
  }

  if (error) {
    return (
      <main>
        <h1>ポケモン図鑑</h1>
        <ThemeToggle />
        <FavoritesSummary />
        <p role="alert">{error}</p>
        <button type="button" onClick={retry}>再試行</button>
      </main>
    )
  }

  if (detailError) {
    return (
      <main>
        <h1>ポケモン図鑑</h1>
        <ThemeToggle />
        <FavoritesSummary />
        <p role="alert">{detailError}</p>
        <button type="button" onClick={closeDetail} autoFocus>一覧に戻る</button>
      </main>
    )
  }

  const selectedPokemon = pokemonList.find((pokemon) => pokemon.id === selectedId)
  if (selectedPokemon) {
    return (
      <main>
        <h1>ポケモン図鑑</h1>
        <ThemeToggle />
        <FavoritesSummary />
        <PokemonDetail pokemon={selectedPokemon} onBack={closeDetail} />
      </main>
    )
  }

  return (
    <main>
      <h1>ポケモン図鑑</h1>
      <ThemeToggle />
      <FavoritesSummary />
      <button type="button" onClick={openFilters}>検索・並び替え</button>
      <Modal dialogRef={dialogRef} title="検索・並び替えの条件" onCancel={() => dispatch({ type: 'filters_cancelled' })}>
        <FilterControls
          query={draft.query}
          onQueryChange={(value) => dispatch({ type: 'draft_changed', changes: { query: value } })}
          selectedTypes={draft.selectedTypes}
          onTypeToggle={toggleType}
          typeMatch={draft.typeMatch}
          onTypeMatchChange={(value) => dispatch({ type: 'draft_changed', changes: { typeMatch: value } })}
          sortOrder={draft.sortOrder}
          onSortChange={(value) => dispatch({ type: 'draft_changed', changes: { sortOrder: value } })}
        />
        <p>「適用」を押すと一覧に反映されます。</p>
        <div className="dialog-actions">
          <button type="button" onClick={resetConditions}>条件をリセット</button>
          <button type="button" onClick={cancelFilters}>キャンセル</button>
          <button type="button" onClick={applyFilters}>適用</button>
        </div>
      </Modal>
      <p className="current-conditions">
        名前: {query.trim() || '指定なし'} ／ タイプ: {selectedTypes.length === 0 ? 'すべて' : selectedTypes.map((type) => typeNames[type]).join(' / ')} ／ 一致: {typeMatch === 'all' ? 'すべて' : 'いずれか'} ／ 並び順: {sortOrder === 'asc' ? '小さい順' : '大きい順'}
      </p>
      <p className="result-summary" role="status">{sortedPokemon.length}匹が見つかりました</p>
      {sortedPokemon.length === 0 && <p>条件に一致するポケモンはいません。</p>}
      {pageCount > 0 && (
        <nav className="pagination" aria-label="一覧のページ">
          <button type="button" disabled={currentPage === 1} onClick={() => commit({ type: 'page_changed', page: currentPage - 1 })}>前へ</button>
          <p role="status">{currentPage} / {pageCount} ページ</p>
          <button type="button" disabled={currentPage === pageCount} onClick={() => commit({ type: 'page_changed', page: currentPage + 1 })}>次へ</button>
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
