import { useState } from 'react'
import pokemonList from './data/pokemon.json'
import PokemonCard from './components/PokemonCard.jsx'
import PokemonDetail from './components/PokemonDetail.jsx'

export default function App() {
  const [selectedId, setSelectedId] = useState(null)

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
      <div className="pokemon-list">
        {pokemonList.map((pokemon) => (
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
