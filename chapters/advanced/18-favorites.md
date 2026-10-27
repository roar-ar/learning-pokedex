# 第18章 お気に入りと保存

ポケモンをお気に入りへ追加・削除できるようにします。選んだ番号をブラウザへ保存し、再読み込みした後も利用します。

## この章の目標

- お気に入りの図鑑番号を、配列の state に保持する
- 重複を防ぎながら、お気に入りを追加・削除する
- localStorage を使い、保存した値を復元する
- 一覧と詳細に、同じお気に入りの状態を反映する




第17章の完成状態から始めます。完成例は [examples/18-favorites/](../../examples/18-favorites/) です。編集する場所はリポジトリ直下の `src/` です。API の対象は番号1〜10のままです。

## ステップ1 保存と復元の関数を用意する

localStorage は再読み込みやタブを閉じた後にも値を保存します。API キャッシュの sessionStorage とは保存先を分けます。保存は文字列なので JSON と相互変換し、壊れたJSONや想定外の型は初期値へ戻します。保存できない場合も、現在の画面の操作は続けられるようにします。

`src/utils/storage.js` を作成し、次の内容を記述します。

```js
export function readStoredValue(key, fallback, isValid) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    const value = JSON.parse(raw)
    return isValid(value) ? value : fallback
  } catch {
    return fallback
  }
}

export function writeStoredValue(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 保存できなくても、現在のタブでは state の値を利用します。
  }
}
```

`src/utils/preferences.js` を作成し、次の内容を記述します。

```js
export function isFavoriteIds(value) {
  return Array.isArray(value)
    && value.every((id) => Number.isInteger(id) && id >= 1 && id <= 10)
    && new Set(value).size === value.length
}
```

**確認：** 保存先の名前は `pokedex:favorites` とします。ファイルを作るだけでは保存はまだ行われません。

## ステップ2 番号の配列を state に保持する

`Array.isArray` で配列か、`Number.isInteger` で整数かを確認します。`Set` は重複しない値の集合で、size と元の長さを比較して重複も検出しています。お気に入りにはポケモン全体ではなく番号だけを保存します。復元は初期化時、保存は値の変更を受けた Effect で行います。

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
import { createDefaultConditions, copyConditions } from './utils/conditions.js'
```

変更後：

```jsx
import { createDefaultConditions, copyConditions } from './utils/conditions.js'
import { readStoredValue, writeStoredValue } from './utils/storage.js'
import { isFavoriteIds } from './utils/preferences.js'
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
  const [page, setPage] = useState(1)
```

変更後：

```jsx
  const [page, setPage] = useState(1)
  const [favoriteIds, setFavoriteIds] = useState(() => readStoredValue('pokedex:favorites', [], isFavoriteIds))

  useEffect(() => {
    writeStoredValue('pokedex:favorites', favoriteIds)
  }, [favoriteIds])
```

**確認：** 再読み込みしても初期値は空の配列です。まだ追加ボタンがないため、件数は次のステップで表示します。

## ステップ3 一覧と詳細で同じお気に入りを操作する

ボタンは押されている状態を `aria-pressed` で伝えます。状態は共通の親である App に保持し、カードと詳細へ同じ操作を渡します。ボタンは詳細を開く操作と別の要素にして、それぞれ独立して使えるようにします。

`src/components/FavoriteButton.jsx` を作成し、次の内容を記述します。

```jsx
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
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
  function handleSelect(id) {
```

変更後：

```jsx
  function toggleFavorite(id) {
    setFavoriteIds((previous) => previous.includes(id)
      ? previous.filter((value) => value !== id)
      : [...previous, id])
  }

  function handleSelect(id) {
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
<PokemonDetail pokemon={selectedPokemon} onBack={() => setSelectedId(null)} />
```

変更後：

```jsx
<PokemonDetail pokemon={selectedPokemon} onBack={() => setSelectedId(null)} isFavorite={favoriteIds.includes(selectedPokemon.id)} onToggleFavorite={toggleFavorite} />
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
            onSelect={handleSelect}
```

変更後：

```jsx
            onSelect={handleSelect}
            isFavorite={favoriteIds.includes(pokemon.id)}
            onToggleFavorite={toggleFavorite}
```

`src/App.jsx` の次の部分を変更します。同じ記述がある箇所は、すべて変更します。変更前：

```jsx
<h1>ポケモン図鑑</h1>
```

変更後：

```jsx
<h1>ポケモン図鑑</h1>
<p className="favorites-summary">お気に入り: {favoriteIds.length}匹</p>
```

`src/components/PokemonCard.jsx` の次の部分を変更します。変更前：

```jsx
import typeNames from '../data/typeNames.ja.json'
```

変更後：

```jsx
import typeNames from '../data/typeNames.ja.json'
import FavoriteButton from './FavoriteButton.jsx'
```

`src/components/PokemonCard.jsx` の次の部分を変更します。変更前：

```jsx
{ pokemon, onSelect, buttonRef }
```

変更後：

```jsx
{ pokemon, onSelect, buttonRef, isFavorite, onToggleFavorite }
```

`src/components/PokemonCard.jsx` の次の部分を変更します。変更前：

```jsx
      <h2 className="pokemon-name">{pokemon.name}</h2>
```

変更後：

```jsx
      <h2 className="pokemon-name">{pokemon.name}</h2>
      <FavoriteButton pokemonId={pokemon.id} pokemonName={pokemon.name} isFavorite={isFavorite} onToggle={onToggleFavorite} />
```

`src/components/PokemonDetail.jsx` の次の部分を変更します。変更前：

```jsx
import typeNames from '../data/typeNames.ja.json'
```

変更後：

```jsx
import typeNames from '../data/typeNames.ja.json'
import FavoriteButton from './FavoriteButton.jsx'
```

`src/components/PokemonDetail.jsx` の次の部分を変更します。変更前：

```jsx
{ pokemon, onBack }
```

変更後：

```jsx
{ pokemon, onBack, isFavorite, onToggleFavorite }
```

`src/components/PokemonDetail.jsx` の次の部分を変更します。変更前：

```jsx
        <h2>{pokemon.name}</h2>
```

変更後：

```jsx
        <h2>{pokemon.name}</h2>
        <FavoriteButton pokemonId={pokemon.id} pokemonName={pokemon.name} isFavorite={isFavorite} onToggle={onToggleFavorite} />
```

`src/styles.css` の末尾に追加します。

```css
.favorite-button {
  margin: 8px 0;
  white-space: normal;
  overflow-wrap: anywhere;
}
```

**確認：** 番号1を一覧でお気に入りにし、詳細を開いても選択済みです。詳細で解除して戻ると、一覧も解除されています。

**予想して確かめる：** 3匹を選んでから再読み込みします。件数と選択が残ることを予想して確認してください。同じ番号を何度も追加・解除しても重複は増えません。

## ステップ4 保存された値を調べる

開発者ツールの Application／アプリケーションから Local Storage を開きます。現在のサイトの `pokedex:favorites` を探してください。検証関数は、正しいJSONでも番号の配列として使えない値を区別します。

**確認：** 保存値が `[1,6]` のような番号の配列です。`"hello"` や `[999]` に一時的に変更して再読み込みすると、空のお気に入りとして起動します。確認後は保存値を削除し、画面から選び直してください。

## 小さな練習

保存先のキーだけを一時的に別の名前へ変えると、元のお気に入りはどう見えるでしょうか。復元側と保存側を両方 `pokedex:favorites-practice` に変更して調べます。確認後は元のキーへ戻し、練習用のキーを開発者ツールで削除してください。

## 完成状態の確認

次の操作を試し、変更した値から表示までの流れを説明してください。各ステップの一時的な変更は元に戻してから次章へ進みます。

- 一覧と詳細で同じ番号のお気に入りを追加・解除できる。

- お気に入りの件数が変化し、再読み込み後も復元される。

- 壊れたJSONや対象外の番号を保存しても、空の配列で起動できる。

自分のコードをビルドする場合は、リポジトリ直下で実行します。

```sh
npm run build
```

完成例を起動する場合は、次を実行します。

```sh
npm run dev:example -- examples/18-favorites
```

完成コードは [src/](../../examples/18-favorites/src/) にあります。前章の完成例と比べ、追加したファイルと変更した箇所を確認できます。

## 参考資料

- [MDN：localStorage](https://developer.mozilla.org/ja/docs/Web/API/Window/localStorage)

- [React：useState の初期化関数](https://ja.react.dev/reference/react/useState#avoiding-recreating-the-initial-state)

[前へ：第17章](17-stat-chart.md) / [次へ：第19章](19-theme.md)
