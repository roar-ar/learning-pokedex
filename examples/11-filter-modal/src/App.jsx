import { useRef, useState } from 'react'
import pokemonList from './data/pokemon.json'
import PokemonCard from './components/PokemonCard.jsx'
import PokemonDetail from './components/PokemonDetail.jsx'
import FilterControls from './components/FilterControls.jsx'

export default function App() {
  const [selectedId, setSelectedId] = useState(null)
  const [query, setQuery] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')
  const dialogRef = useRef(null)

  const normalizedQuery = query.trim().toLowerCase()
  const filteredPokemon = pokemonList.filter((pokemon) => {
    const matchesName = pokemon.nameja.toLowerCase().includes(normalizedQuery)
    const matchesType = selectedType === '' || pokemon.types.some((entry) => entry.type.name === selectedType)
    return matchesName && matchesType
  })
  const sortedPokemon = [...filteredPokemon].sort((a, b) => (
    sortOrder === 'asc' ? a.id - b.id : b.id - a.id
  ))
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
        <button type="button" onClick={() => dialogRef.current.close()}>条件を閉じる</button>
      </dialog>
      <p className="result-summary" role="status">{sortedPokemon.length}匹が見つかりました</p>
      {sortedPokemon.length === 0 && <p>条件に一致するポケモンはいません。</p>}
      <div className="pokemon-list">
        {sortedPokemon.map((pokemon) => (
          <PokemonCard
            key={pokemon.id}
            pokemon={pokemon}
            onSelect={setSelectedId}
          />
        ))}
      </div>
    </main>
  )
}
