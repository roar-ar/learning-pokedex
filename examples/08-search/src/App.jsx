import { useState } from 'react'
import pokemonList from './data/pokemon.json'
import PokemonCard from './components/PokemonCard.jsx'
import PokemonDetail from './components/PokemonDetail.jsx'

export default function App() {
  const [selectedId, setSelectedId] = useState(null)
  const [query, setQuery] = useState('')

  const normalizedQuery = query.trim().toLowerCase()
  const filteredPokemon = pokemonList.filter((pokemon) => {
    const matchesName = pokemon.nameja.toLowerCase().includes(normalizedQuery)
    return matchesName
  })
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
      <div className="filter-controls">
        <label className="filter-field" htmlFor="name-search">
          名前
          <input
            id="name-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>
      <p className="result-summary" role="status">{filteredPokemon.length}匹が見つかりました</p>
      {filteredPokemon.length === 0 && <p>条件に一致するポケモンはいません。</p>}
      <div className="pokemon-list">
        {filteredPokemon.map((pokemon) => (
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
