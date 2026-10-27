export default function FavoriteButton({ pokemonId, pokemonName, isFavorite, onToggle }) {
  return (
    <button
      className="favorite-button"
      type="button"
      aria-pressed={isFavorite}
      onClick={() => onToggle(pokemonId)}
    >
      {pokemonName}のお気に入り{isFavorite ? 'を解除' : 'に追加'}
    </button>
  )
}
