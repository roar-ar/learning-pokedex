import { useFavorites } from '../contexts/FavoritesContext.jsx'

export default function FavoritesSummary() {
  const { favoriteIds } = useFavorites()
  return <p className="favorites-summary">お気に入り: {favoriteIds.length}匹</p>
}
