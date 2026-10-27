import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { FavoritesProvider } from './contexts/FavoritesContext.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <FavoritesProvider>
      <App />
    </FavoritesProvider>
  </ThemeProvider>,
)
