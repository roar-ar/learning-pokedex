# 第25章 個別の詳細 URL

ポケモンの詳細を、図鑑番号に対応する URL で開けるようにします。URL から直接開く操作と、一覧・詳細の間を移動する操作をつなげます。

## この章の目標

- URL から、表示するポケモンの図鑑番号を読み取る
- 一覧・詳細の表示を、URL と対応させる
- 直接アクセスや「戻る・進む」で、適切な画面を表示する
- 不正な番号や対象に含まれない番号を、画面で案内する




第24章の完成状態から始めます。完成例は [examples/25-detail-url/](../../examples/25-detail-url/) です。編集する場所はリポジトリ直下の `src/` です。API の対象は番号1〜10のままです。

## ステップ1 詳細を表す URL の形式を決める

詳細は同じパスの `?pokemon=6` で表します。第24章の検索条件と併記できるので、例えば `?types=fire&page=1&pokemon=6` の形で一覧の条件も保持できます。既定値の page=1 は前章の同期で省略されます。pathname を変えないため、この教材のローカル開発・プレビューでは追加のルーティング設定は不要です。

`src/utils/detailUrl.js` を作成し、次の内容を記述します。

```js
export function readDetailUrl(search = window.location.search) {
  const params = new URLSearchParams(search)
  const value = params.get('pokemon')
  if (value === null) return { selectedId: null, detailError: '' }
  const id = /^[1-9]\d*$/.test(value) ? Number(value) : NaN
  if (!Number.isInteger(id) || id < 1 || id > 10) {
    return { selectedId: null, detailError: 'この図鑑では番号1〜10の詳細を表示できます。' }
  }
  return { selectedId: id, detailError: '' }
}

export function detailHref(id) {
  const url = new URL(window.location.href)
  if (id === null) url.searchParams.delete('pokemon')
  else url.searchParams.set('pokemon', String(id))
  return url.pathname + url.search + url.hash
}

export function writeDetailUrl(id) {
  const target = detailHref(id)
  const current = window.location.pathname + window.location.search + window.location.hash
  if (target !== current) window.history.pushState(null, '', target)
}
```

**確認：** 番号を読み取る関数とURLを作る関数を追加します。存在しない番号と、一覧を表示する状態を別々に扱うことを確認します。

## ステップ2 選択した番号を URL から復元する

Hook の内部にURLから読んだ状態を保持します。直接アクセス時は初期化で読み、戻る・進むでは popstate から読み直します。自分でURLを変更したときは popstate が発生しないため、その直後に state も更新します。

`src/hooks/useDetailUrl.js` を作成し、次の内容を記述します。

```js
import { useEffect, useState } from 'react'
import { readDetailUrl, writeDetailUrl } from '../utils/detailUrl.js'

export default function useDetailUrl() {
  const [detail, setDetail] = useState(readDetailUrl)

  useEffect(() => {
    function restore() {
      setDetail(readDetailUrl())
    }
    window.addEventListener('popstate', restore)
    return () => window.removeEventListener('popstate', restore)
  }, [])

  function openDetail(id) {
    writeDetailUrl(id)
    setDetail(readDetailUrl())
  }

  function closeDetail() {
    writeDetailUrl(null)
    setDetail(readDetailUrl())
  }

  return { ...detail, openDetail, closeDetail }
}
```

**確認：** Hook を保存します。URLに番号がなければ一覧、不正なら案内、有効なら詳細という3つの状態を返します。

## ステップ3 一覧と詳細の切り替えを接続する

画面の選択番号を直接 useState で管理する代わりに、URLと対応した Hook の値を使います。「一覧に戻る」は pokemon パラメーターだけを取り除いたURLへ移動します。history.back() に任せないため、別のサイトから詳細へ直接来た場合でも図鑑の一覧へ戻れます。一覧へ戻る操作も履歴に残るので、ブラウザの戻るで直前の詳細へ戻れます。

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
import useCatalogUrl from './hooks/useCatalogUrl.js'
```

変更後：

```jsx
import useCatalogUrl from './hooks/useCatalogUrl.js'
import useDetailUrl from './hooks/useDetailUrl.js'
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
  const [selectedId, setSelectedId] = useState(null)
```

変更後：

```jsx
  const { selectedId, detailError, openDetail, closeDetail } = useDetailUrl()
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
    setSelectedId(id)
```

変更後：

```jsx
    openDetail(id)
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
dialogRef, onNavigate: setSelectedId })
```

変更後：

```jsx
dialogRef })
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
onBack={() => setSelectedId(null)}
```

変更後：

```jsx
onBack={closeDetail}
```

**確認：** `?pokemon=6` を直接開くと charizard の詳細になります。「一覧に戻る」で一覧になり、ブラウザの戻る・進むでも表示が切り替わります。

**予想して確かめる：** 2ページ目から詳細を開いて一覧へ戻り、ページと条件が維持されることを確認します。新しいタブで詳細URLを直接開いた場合も、一覧へ戻るボタンが使えます。

## ステップ4 不正な URL を画面で案内する

空の pokemon、0、11、文字列などはこの図鑑の対象外です。不正な値を勝手に1番へ置き換えず、利用できる番号と一覧へ戻る操作を示します。APIの読み込みエラーとは別の案内にして、再試行で直らない入力を区別します。

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
  const selectedPokemon = pokemonList.find((pokemon) => pokemon.id === selectedId)
```

変更後：

```jsx
  if (detailError) {
    return (
      <main>
        <h1>ポケモン図鑑</h1>
        <ThemeToggle />
        <FavoritesSummary />
        <p role="alert">{detailError}</p>
        <button type="button" onClick={closeDetail} autoFocus>一覧に戻る</button>
      </main>
    )
  }

  const selectedPokemon = pokemonList.find((pokemon) => pokemon.id === selectedId)
```

**確認：** `?pokemon=abc`、`?pokemon=0`、`?pokemon=11` で番号の案内が表示されます。一覧へ戻ると不正な pokemon だけが取り除かれ、検索条件は維持されます。

## ステップ5 詳細を開く操作をリンクにする

URLのある移動には a 要素を使うと、リンク先のコピーや新しいタブで開く操作ができます。通常のクリックは preventDefault でページ全体の再読み込みを止め、Hookを通して表示を切り替えます。Ctrl・Command・Shift などを使う操作はブラウザへ任せます。詳細から戻る際の ref は、今度はリンクを参照します。

`src/components/PokemonCard.jsx` の次の部分を変更します。変更前：

```jsx
import FavoriteButton from './FavoriteButton.jsx'
```

変更後：

```jsx
import FavoriteButton from './FavoriteButton.jsx'
import { detailHref } from '../utils/detailUrl.js'
```

`src/components/PokemonCard.jsx` の次の部分を変更します。変更前：

```jsx
      <button
        ref={buttonRef}
        className="pokemon-select"
        type="button"
        onClick={() => onSelect(pokemon.id)}
      >
        {pokemon.name}の詳細を見る
      </button>
```

変更後：

```jsx
      <a
        ref={buttonRef}
        className="pokemon-select"
        href={detailHref(pokemon.id)}
        onClick={(event) => {
          if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
          event.preventDefault()
          onSelect(pokemon.id)
        }}
      >
        {pokemon.name}の詳細を見る
      </a>
```

`src/styles.css` の末尾に追加します。

```css
.pokemon-select[href] {
  display: block;
  padding: 10px 14px;
  border: 1px solid var(--color-accent);
  border-radius: 8px;
  color: var(--color-button-text);
  background-color: var(--color-accent);
  text-align: center;
  text-decoration: none;
}

.pokemon-select[href]:hover {
  background-color: var(--color-hover);
}
```

**確認：** 通常クリックでは図鑑内で切り替わり、リンクのコピーや Ctrl／Command を押したクリックでは個別のURLを扱えます。一覧に戻ると、開いたポケモンのリンクへフォーカスが戻ります。

## ステップ6 条件と詳細の履歴を一緒に確認する

一覧の条件と詳細番号は同じURLの別のパラメーターです。前章のURL更新は担当するキーだけを書き換えるため、詳細番号を壊しません。popstate を購読する2つの Hook が、それぞれURLから必要な値を読み取ります。復元時には編集中のモーダルを閉じ、URLに記録された適用済み条件へ戻します。

**確認：** ほのおで絞る→適用→詳細を開く→一覧へ戻る→ブラウザの戻る・進むを試し、条件・ページ・詳細がURLに対応することを確認します。お気に入りとテーマはURLに含めず、保存した設定を使います。

## 小さな練習

アドレス欄の pokemon を6から1へ書き換えて開き、何が初期化され何が保存から復元されるか説明します。次にURLを別タブへ貼り付け、一覧条件と詳細が再現されることを確認してください。URLに含める状態と、localStorageへ保存する設定の役割の違いを説明します。

## 完成状態の確認

次の操作を試し、変更した値から表示までの流れを説明してください。各ステップの一時的な変更は元に戻してから次章へ進みます。

- 詳細URLを直接開き、再読み込みと戻る・進むで表示を復元する。

- 一覧に戻ると検索条件とページが維持され、一覧から開いたリンクへフォーカスが戻る。

- 不正な番号では案内が出て、条件を維持した一覧へ戻れる。

- 詳細リンクのコピー・新しいタブで開く操作ができる。

自分のコードをビルドする場合は、リポジトリ直下で実行します。

```sh
npm run build
```

完成例を起動する場合は、次を実行します。

```sh
npm run dev:example -- examples/25-detail-url
```

完成コードは [src/](../../examples/25-detail-url/src/) にあります。前章の完成例と比べ、追加したファイルと変更した箇所を確認できます。

## 参考資料

- [MDN：a 要素](https://developer.mozilla.org/ja/docs/Web/HTML/Reference/Elements/a)

- [MDN：Event.preventDefault](https://developer.mozilla.org/ja/docs/Web/API/Event/preventDefault)

- [MDN：履歴 API の操作](https://developer.mozilla.org/ja/docs/Web/API/History_API/Working_with_the_History_API)

[前へ：第24章](24-query-string.md) / [README に戻る](../../README.md)
