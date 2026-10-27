# 第23章 Context

テーマとお気に入りを、Context を通して複数のコンポーネントへ届けます。共有する値を管理する場所と、その値を利用する部品を整理します。

## この章の目標

- Context を作り、Provider で値と更新用の操作を提供する
- useContext で、テーマやお気に入りを利用する
- 共有する state を Provider に保持する
- 値を利用する範囲に合わせて、Provider を配置する




第22章の完成状態から始めます。完成例は [examples/23-context/](../../examples/23-context/) です。編集する場所はリポジトリ直下の `src/` です。API の対象は番号1〜10のままです。

## ステップ1 お気に入りを管理する Provider を作る

前章までは App が持つお気に入りを props でカードと詳細へ渡していました。Context は、その Provider の下にある部品へ値を届けます。共有される state は Provider に1つだけ置きます。useStoredState は保存のロジックを再利用し、Context はその呼び出しが持つ値を共有します。

`src/contexts/FavoritesContext.jsx` を作成し、次の内容を記述します。

```jsx
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
```

**確認：** Provider のファイルを保存します。まだ App を囲んでいないため、画面の接続は後のステップで行います。

## ステップ2 テーマを別の Context で管理する

テーマはお気に入りとは独立した設定なので、別の Context にします。createContext の既定値 null を確認することで、Provider の配置を忘れた場合も原因を見つけやすくします。useContext 自体は state を作りません。最も近い Provider の値を読みます。

`src/contexts/ThemeContext.jsx` を作成し、次の内容を記述します。

```jsx
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
```

**確認：** テーマの保存と html 属性への反映が Provider にまとまります。検索条件を扱う reducer は変更しません。

## ステップ3 値を使う部品から Context を読む

お気に入りのボタンと件数、テーマの切り替えボタンが、それぞれ必要な Context を読みます。見た目のための pokemonId や pokemonName は引き続き props です。すべての値を Context へ移す必要はありません。このステップから次の配置までを続けて変更します。

`src/components/FavoriteButton.jsx` 全体を次に置き換えます。

```jsx
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
```

`src/components/FavoritesSummary.jsx` を作成し、次の内容を記述します。

```jsx
import { useFavorites } from '../contexts/FavoritesContext.jsx'

export default function FavoritesSummary() {
  const { favoriteIds } = useFavorites()
  return <p className="favorites-summary">お気に入り: {favoriteIds.length}匹</p>
}
```

`src/components/ThemeToggle.jsx` 全体を次に置き換えます。

```jsx
import { useTheme } from '../contexts/ThemeContext.jsx'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button type="button" className="theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      {theme === 'dark' ? 'ライト' : 'ダーク'}テーマに切り替える
    </button>
  )
}
```

**確認：** 部品の引数から共有状態の props が減っています。Provider を配置した後に動作を確認します。

## ステップ4 共通の親で Provider を配置する

一覧と詳細の切り替えでも Provider が取り除かれないよう、main.jsx で App の外側を囲みます。共有の範囲は Provider の子孫です。App に残っていた同じ state を削除し、二重に管理しないようにします。完成した App 全体も示すので、古い props や更新関数が残っていないか照合してください。

`src/main.jsx` 全体を次に置き換えます。

```jsx
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
```

`src/components/PokemonCard.jsx` の次の部分を変更します。変更前：

```jsx
, isFavorite, onToggleFavorite }
```

変更後：

```jsx
 }
```

`src/components/PokemonCard.jsx` の次の部分を変更します。変更前：

```jsx
 isFavorite={isFavorite} onToggle={onToggleFavorite}
```

この部分を削除します。

`src/components/PokemonDetail.jsx` の次の部分を変更します。変更前：

```jsx
, isFavorite, onToggleFavorite }
```

変更後：

```jsx
 }
```

`src/components/PokemonDetail.jsx` の次の部分を変更します。変更前：

```jsx
 isFavorite={isFavorite} onToggle={onToggleFavorite}
```

この部分を削除します。

`src/App.jsx` 全体を次に置き換えます。

```jsx
import { useEffect, useReducer, useRef, useState } from 'react'
import usePokemonList from './hooks/usePokemonList.js'
import PokemonCard from './components/PokemonCard.jsx'
import PokemonDetail from './components/PokemonDetail.jsx'
import FilterControls from './components/FilterControls.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import FavoritesSummary from './components/FavoritesSummary.jsx'
import Modal from './components/Modal.jsx'
import typeNames from './data/typeNames.ja.json'
import { catalogReducer, createInitialCatalogState } from './state/catalogReducer.js'

const PAGE_SIZE = 3

export default function App() {
  const [selectedId, setSelectedId] = useState(null)
  const [catalog, dispatch] = useReducer(catalogReducer, undefined, createInitialCatalogState)
  const { conditions, draft, page } = catalog
  const { query, selectedTypes, typeMatch, sortOrder } = conditions
  const dialogRef = useRef(null)
  const { pokemonList, loading, error, loadedCount, retry } = usePokemonList()
  const [lastSelectedId, setLastSelectedId] = useState(null)
  const returnButtonRef = useRef(null)

  useEffect(() => {
    if (selectedId === null && lastSelectedId !== null) {
      returnButtonRef.current?.focus()
    }
  }, [selectedId, lastSelectedId])

  function handleSelect(id) {
    setLastSelectedId(id)
    setSelectedId(id)
  }

  function openFilters() {
    dispatch({ type: 'filters_opened' })
    dialogRef.current.showModal()
  }

  function toggleType(type) {
    dispatch({ type: 'type_toggled', value: type })
  }

  function applyFilters() {
    dispatch({ type: 'filters_applied' })
    dialogRef.current.close()
  }

  function cancelFilters() {
    dispatch({ type: 'filters_cancelled' })
    dialogRef.current.close()
  }

  function resetConditions() {
    dispatch({ type: 'draft_reset' })
  }

  const normalizedQuery = query.trim().toLowerCase()
  const filteredPokemon = pokemonList.filter((pokemon) => {
    const matchesName = pokemon.name.toLowerCase().includes(normalizedQuery)
    const matchesSelectedTypes = typeMatch === 'all'
      ? selectedTypes.every((type) => pokemon.types.some((entry) => entry.type.name === type))
      : selectedTypes.some((type) => pokemon.types.some((entry) => entry.type.name === type))
    const matchesType = selectedTypes.length === 0 || matchesSelectedTypes
    return matchesName && matchesType
  })
  const sortedPokemon = [...filteredPokemon].sort((a, b) => (
    sortOrder === 'asc' ? a.id - b.id : b.id - a.id
  ))
  const pageCount = Math.ceil(sortedPokemon.length / PAGE_SIZE)
  const currentPage = Math.min(page, Math.max(1, pageCount))
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const visiblePokemon = sortedPokemon.slice(startIndex, startIndex + PAGE_SIZE)

  if (loading) {
    return (
      <main>
        <h1>ポケモン図鑑</h1>
        <ThemeToggle />
        <FavoritesSummary />
        <p role="status">読み込み中… {loadedCount} / 10</p>
      </main>
    )
  }

  if (error) {
    return (
      <main>
        <h1>ポケモン図鑑</h1>
        <ThemeToggle />
        <FavoritesSummary />
        <p role="alert">{error}</p>
        <button type="button" onClick={retry}>再試行</button>
      </main>
    )
  }

  const selectedPokemon = pokemonList.find((pokemon) => pokemon.id === selectedId)
  if (selectedPokemon) {
    return (
      <main>
        <h1>ポケモン図鑑</h1>
        <ThemeToggle />
        <FavoritesSummary />
        <PokemonDetail pokemon={selectedPokemon} onBack={() => setSelectedId(null)} />
      </main>
    )
  }

  return (
    <main>
      <h1>ポケモン図鑑</h1>
      <ThemeToggle />
      <FavoritesSummary />
      <button type="button" onClick={openFilters}>検索・並び替え</button>
      <Modal dialogRef={dialogRef} title="検索・並び替えの条件" onCancel={() => dispatch({ type: 'filters_cancelled' })}>
        <FilterControls
          query={draft.query}
          onQueryChange={(value) => dispatch({ type: 'draft_changed', changes: { query: value } })}
          selectedTypes={draft.selectedTypes}
          onTypeToggle={toggleType}
          typeMatch={draft.typeMatch}
          onTypeMatchChange={(value) => dispatch({ type: 'draft_changed', changes: { typeMatch: value } })}
          sortOrder={draft.sortOrder}
          onSortChange={(value) => dispatch({ type: 'draft_changed', changes: { sortOrder: value } })}
        />
        <p>「適用」を押すと一覧に反映されます。</p>
        <div className="dialog-actions">
          <button type="button" onClick={resetConditions}>条件をリセット</button>
          <button type="button" onClick={cancelFilters}>キャンセル</button>
          <button type="button" onClick={applyFilters}>適用</button>
        </div>
      </Modal>
      <p className="current-conditions">
        名前: {query.trim() || '指定なし'} ／ タイプ: {selectedTypes.length === 0 ? 'すべて' : selectedTypes.map((type) => typeNames[type]).join(' / ')} ／ 一致: {typeMatch === 'all' ? 'すべて' : 'いずれか'} ／ 並び順: {sortOrder === 'asc' ? '小さい順' : '大きい順'}
      </p>
      <p className="result-summary" role="status">{sortedPokemon.length}匹が見つかりました</p>
      {sortedPokemon.length === 0 && <p>条件に一致するポケモンはいません。</p>}
      {pageCount > 0 && (
        <nav className="pagination" aria-label="一覧のページ">
          <button type="button" disabled={currentPage === 1} onClick={() => dispatch({ type: 'page_changed', page: currentPage - 1 })}>前へ</button>
          <p role="status">{currentPage} / {pageCount} ページ</p>
          <button type="button" disabled={currentPage === pageCount} onClick={() => dispatch({ type: 'page_changed', page: currentPage + 1 })}>次へ</button>
        </nav>
      )}
      <div className="pokemon-list">
        {visiblePokemon.map((pokemon) => (
          <PokemonCard
            key={pokemon.id}
            pokemon={pokemon}
            onSelect={handleSelect}
            buttonRef={pokemon.id === lastSelectedId ? returnButtonRef : null}
          />
        ))}
      </div>
    </main>
  )
}
```

**確認：** 一覧でお気に入りを追加すると件数と詳細のボタンが同じ状態になります。詳細でテーマを変えて一覧へ戻ってもテーマが維持され、再読み込み後も保存値が復元されます。

## ステップ5 共有する範囲を変えて比較する

Provider を2つ配置すると、それぞれ別の state を持ちます。同じ Context の内側にさらに Provider がある場合、内側の値が優先されます。保存キーが同じでも、今回の保存 Hook は Provider 同士の変更を通知しないため、自動同期はしません。

**確認：** 次の練習で件数の更新範囲が変わることを確認し、完了後は共有の Provider を1つに戻します。

**予想して確かめる：** main.jsx に `import FavoritesSummary from "./components/FavoritesSummary.jsx"` を追加し、App の隣へ `<FavoritesSummary />` を一時的に置きます。同じ FavoritesProvider 内なら件数が連動することを確認します。次にその Summary だけを別の FavoritesProvider で囲み、操作中の件数が連動しなくなることを比較します。練習中は再読み込みせず観察し、確認後は追加した import・表示・Provider を削除してください。

## 小さな練習

FavoritesProvider を一時的に外すと、どの部品でどのエラーが出るでしょうか。コンソールを確認し、Provider を元へ戻します。テーマとお気に入りの共有範囲、検索条件が reducer に残っている理由を説明してください。

## 完成状態の確認

次の操作を試し、変更した値から表示までの流れを説明してください。各ステップの一時的な変更は元に戻してから次章へ進みます。

- 一覧のボタン、詳細のボタン、件数が同じ Provider の状態を使う。

- テーマとお気に入りを変え、画面移動と再読み込みでも維持される。

- 検索条件の適用・キャンセルとページ操作が維持される。

自分のコードをビルドする場合は、リポジトリ直下で実行します。

```sh
npm run build
```

完成例を起動する場合は、次を実行します。

```sh
npm run dev:example -- examples/23-context
```

完成コードは [src/](../../examples/23-context/src/) にあります。前章の完成例と比べ、追加したファイルと変更した箇所を確認できます。

## 参考資料

- [React：コンテクストで深くデータを受け渡す](https://ja.react.dev/learn/passing-data-deeply-with-context)

- [React：useContext](https://ja.react.dev/reference/react/useContext)

[前へ：第22章](22-reducer.md) / [次へ：第24章](24-query-string.md)
