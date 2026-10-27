import typeNames from '../data/typeNames.ja.json'
import FavoriteButton from './FavoriteButton.jsx'

export default function PokemonCard({ pokemon, onSelect, buttonRef, isFavorite, onToggleFavorite }) {
  const imageUrl = pokemon.sprites.other['official-artwork'].front_default

  return (
    <article className="pokemon-card">
      <img className="pokemon-image" src={imageUrl} alt={pokemon.name} />
      <h2 className="pokemon-name">{pokemon.name}</h2>
      <FavoriteButton pokemonId={pokemon.id} pokemonName={pokemon.name} isFavorite={isFavorite} onToggle={onToggleFavorite} />
      <p className="pokemon-number">図鑑番号: {pokemon.id}</p>
      <ul className="pokemon-info">
        <li>タイプ: {pokemon.types.map((entry) => typeNames[entry.type.name]).join(' / ')}</li>
        <li>高さ: {pokemon.height / 10} m</li>
        <li>重さ: {pokemon.weight / 10} kg</li>
      </ul>
      <button
        ref={buttonRef}
        className="pokemon-select"
        type="button"
        onClick={() => onSelect(pokemon.id)}
      >
        {pokemon.name}の詳細を見る
      </button>
    </article>
  )
}
