import typeNames from '../data/typeNames.ja.json'
import FavoriteButton from './FavoriteButton.jsx'
import { detailHref } from '../utils/detailUrl.js'

export default function PokemonCard({ pokemon, onSelect, buttonRef }) {
  const imageUrl = pokemon.sprites.other['official-artwork'].front_default

  return (
    <article className="pokemon-card">
      <img className="pokemon-image" src={imageUrl} alt={pokemon.name} />
      <h2 className="pokemon-name">{pokemon.name}</h2>
      <FavoriteButton pokemonId={pokemon.id} pokemonName={pokemon.name} />
      <p className="pokemon-number">図鑑番号: {pokemon.id}</p>
      <ul className="pokemon-info">
        <li>タイプ: {pokemon.types.map((entry) => typeNames[entry.type.name]).join(' / ')}</li>
        <li>高さ: {pokemon.height / 10} m</li>
        <li>重さ: {pokemon.weight / 10} kg</li>
      </ul>
      <a
        ref={buttonRef}
        className="pokemon-select"
        href={detailHref(pokemon.id)}
        onClick={(event) => {
          if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
          event.preventDefault()
          onSelect(pokemon.id)
        }}
      >
        {pokemon.name}の詳細を見る
      </a>
    </article>
  )
}
