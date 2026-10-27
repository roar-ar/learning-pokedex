import { useTheme } from '../contexts/ThemeContext.jsx'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button type="button" className="theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      {theme === 'dark' ? 'ライト' : 'ダーク'}テーマに切り替える
    </button>
  )
}
