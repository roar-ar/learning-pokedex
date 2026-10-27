import { createContext, useContext } from 'react'
import useStoredState from '../hooks/useStoredState.js'
import { isFavoriteIds } from '../utils/preferences.js'

const FavoritesContext = createContext(null)

export function FavoritesProvider({ children }) {
  const [favoriteIds, setFavoriteIds] = useStoredState('pokedex:favorites', [], isFavoriteIds)

  function toggleFavorite(id) {
    setFavoriteIds((previous) => previous.includes(id)
      ? previous.filter((value) => value !== id)
      : [...previous, id])
  }

  return (
    <FavoritesContext.Provider value={{ favoriteIds, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const value = useContext(FavoritesContext)
  if (value === null) throw new Error('FavoritesProvider の内側で使用してください。')
  return value
}
