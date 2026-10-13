import pokemonList from './data/pokemon.json'
import PokemonCard from './components/PokemonCard.jsx'

export default function App() {

  return (
    <main>
      <h1>ポケモン図鑑</h1>
      <div className="pokemon-list">
        {pokemonList.map((pokemon) => (
          <PokemonCard
            key={pokemon.id}
            pokemon={pokemon}
          />
        ))}
      </div>
    </main>
  )
}
