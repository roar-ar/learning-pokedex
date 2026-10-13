import { useState } from 'react'
import pokemonList from './data/pokemon.json'
import PokemonCard from './components/PokemonCard.jsx'

export default function App() {
  const [selectedId, setSelectedId] = useState(null)

  return (
    <main>
      <h1>ポケモン図鑑</h1>
      <p className="result-summary" role="status">選択した番号: {selectedId === null ? '未選択' : selectedId}</p>
      <div className="pokemon-list">
        {pokemonList.map((pokemon) => (
          <PokemonCard
            key={pokemon.id}
            pokemon={pokemon}
            onSelect={setSelectedId}
            isSelected={pokemon.id === selectedId}
          />
        ))}
      </div>
    </main>
  )
}
