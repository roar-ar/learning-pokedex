import { createContext, useContext, useEffect } from 'react'
import useStoredState from '../hooks/useStoredState.js'
import { isTheme } from '../utils/preferences.js'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useStoredState('pokedex:theme', 'light', isTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const value = useContext(ThemeContext)
  if (value === null) throw new Error('ThemeProvider の内側で使用してください。')
  return value
}
