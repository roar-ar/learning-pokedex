import pokemonList from './data/pokemon.json'
import PokemonCard from './components/PokemonCard.jsx'

export default function App() {
  const pokemon = pokemonList[0]

  return (
    <main>
      <h1>ポケモン図鑑</h1>
      <PokemonCard pokemon={pokemon} />
    </main>
  )
}
