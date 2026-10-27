import { useFavorites } from '../contexts/FavoritesContext.jsx'

export default function FavoriteButton({ pokemonId, pokemonName }) {
  const { favoriteIds, toggleFavorite } = useFavorites()
  const isFavorite = favoriteIds.includes(pokemonId)

  return (
    <button className="favorite-button" type="button" aria-pressed={isFavorite} onClick={() => toggleFavorite(pokemonId)}>
      {pokemonName}のお気に入り{isFavorite ? 'を解除' : 'に追加'}
    </button>
  )
}
