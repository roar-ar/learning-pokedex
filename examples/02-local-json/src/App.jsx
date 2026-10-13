import pokemonList from './data/pokemon.json'
import typeNames from './data/typeNames.ja.json'

export default function App() {
  const pokemon = pokemonList[0]
  const firstType = pokemon.types[0].type.name

  return (
    <main>
      <h1>ポケモン図鑑</h1>
      <article>
        <h2>{pokemon.nameja}</h2>
        <p>図鑑番号: {pokemon.id}</p>
        <ul>
          <li>タイプ: {typeNames[firstType]}</li>
          <li>高さ: {pokemon.height / 10} m</li>
          <li>重さ: {pokemon.weight / 10} kg</li>
        </ul>
      </article>
    </main>
  )
}
