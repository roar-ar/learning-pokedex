export default function ThemeToggle({ theme, onThemeChange }) {
  return (
    <button type="button" className="theme-toggle" onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}>
      {theme === 'dark' ? 'ライト' : 'ダーク'}テーマに切り替える
    </button>
  )
}
