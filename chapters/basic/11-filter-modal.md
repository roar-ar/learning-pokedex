# 第11章 条件操作のモーダル

完成した検索・絞り込み・並び替えの操作をモーダルへ移します。条件は変更した時点で反映し、閉じても維持します。

## この章の目標

- 入力欄をコンポーネントに分ける
- `useRef` でブラウザの要素を参照する
- `dialog` を開閉し、キーボードで操作する

第10章の完成状態から始めます。完成例は [examples/11-filter-modal/](../../examples/11-filter-modal/) です。

## ステップ1 条件の入力欄を部品にする

入力の値は親の `App` が保持し、入力欄の部品には値と更新用の関数を渡します。第04章の props と、第06章のイベントの受け渡しを使います。

`src/components/FilterControls.jsx` を作ります。

```jsx
import typeNames from '../data/typeNames.ja.json'

export default function FilterControls({ query, onQueryChange, selectedType, onTypeChange, sortOrder, onSortChange }) {
  return (
    <div className="filter-controls">
      <label className="filter-field" htmlFor="name-search">
        名前
        <input
          id="name-search"
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </label>
      <label className="filter-field" htmlFor="type-filter">
        タイプ
        <select id="type-filter" value={selectedType} onChange={(event) => onTypeChange(event.target.value)}>
          <option value="">すべて</option>
          {Object.keys(typeNames).map((type) => (
            <option key={type} value={type}>{typeNames[type]}</option>
          ))}
        </select>
      </label>
      <label className="filter-field" htmlFor="sort-order">
        並び順
        <select id="sort-order" value={sortOrder} onChange={(event) => onSortChange(event.target.value)}>
          <option value="asc">図鑑番号が小さい順</option>
          <option value="desc">図鑑番号が大きい順</option>
        </select>
      </label>
    </div>
  )
}
```

親の `App.jsx` で import します。

```js
import FilterControls from './components/FilterControls.jsx'
```

親にあった `filter-controls` の `div` 全体を、次に置き換えます。対応表を使うのは子へ移ったので、親の `typeNames` の import は削除します。

```jsx
<FilterControls
  query={query}
  onQueryChange={setQuery}
  selectedType={selectedType}
  onTypeChange={setSelectedType}
  sortOrder={sortOrder}
  onSortChange={setSortOrder}
/>
```

**確認：** 見た目と動作は第10章と同じです。検索・絞り込み・並び替えを試してから次へ進みます。

## ステップ2 dialog を参照する準備をする

`useRef` は、ブラウザ上の要素への参照などを保持できます。今回は `dialog` の開閉メソッドを呼ぶために使います。[React：ref で DOM を操作する](https://ja.react.dev/learn/manipulating-the-dom-with-refs)

`App.jsx` の React の import を変更します。

```js
import { useRef, useState } from 'react'
```

ほかの Hooks と並べて追加します。

```js
const dialogRef = useRef(null)
```

最初は要素がないため `null` です。次のステップで `ref` 属性を付けると、表示後に `dialogRef.current` で要素を参照できます。

state は値の更新に合わせて表示を更新するときに使い、ref は表示の計算に使わない参照を保持するときに使います。`ref.current` を変えても再レンダーは起きません。今回はブラウザの要素を操作するために ref を使います。[React：useRef](https://ja.react.dev/reference/react/useRef)

**確認：** 保存しても表示は変わりません。次のステップでは、クリック時にこの参照を使います。

## ステップ3 モーダルを開閉する

`FilterControls` を置いていた場所を次のようにします。

```jsx
<button type="button" onClick={() => dialogRef.current.showModal()}>検索・並び替え</button>
<dialog className="filters-dialog" ref={dialogRef} aria-labelledby="filters-title">
  <h2 id="filters-title">検索・並び替えの条件</h2>
  <FilterControls
    query={query}
    onQueryChange={setQuery}
    selectedType={selectedType}
    onTypeChange={setSelectedType}
    sortOrder={sortOrder}
    onSortChange={setSortOrder}
  />
  <p role="status">{sortedPokemon.length}匹が見つかりました</p>
  <button type="button" onClick={() => dialogRef.current.close()}>条件を閉じる</button>
</dialog>
```

`dialog` はブラウザ標準のダイアログ要素です。`showModal()` で開くと、背景の操作が制限され、モーダル内へフォーカスが移動します。`close()` で閉じられます。[MDN：dialog 要素](https://developer.mozilla.org/ja/docs/Web/HTML/Reference/Elements/dialog)

`aria-labelledby` は、ダイアログの名前として使う見出しの `id` を指定しています。

**確認：** ボタンから条件画面が開き、「条件を閉じる」で閉じます。名前を変更すると、モーダル内の件数も変わります。閉じた後の一覧に条件が反映されていることを確かめてください。

## ステップ4 背景と枠を整える

`styles.css` の末尾に追加します。

```css
.filters-dialog {
  width: min(480px, calc(100% - 32px));
  max-height: calc(100% - 32px);
  padding: 24px;
  overflow: auto;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  color: inherit;
  background-color: var(--color-surface);
}

.filters-dialog::backdrop {
  background-color: rgb(0 0 0 / 40%);
}
```

`min` は小さいほうの幅を選び、`calc` は画面から余白を引く計算です。`::backdrop` はモーダルの背後にある領域を指定します。

**確認：** 背景が薄暗くなり、条件画面が中央に表示されます。高さが足りない場合は、内容をスクロールできます。

## ステップ5 キーボード操作を確認する

開くボタンへ `Tab` で移動し、`Enter` で開きます。

**確認：** 次を順番に試します。

1. 入力欄へフォーカスが移る。
2. `Tab` と `Shift + Tab` でモーダル内を移動でき、背景のカードへ移動しない。
3. `Escape` で閉じられる。
4. 開いたボタンへフォーカスが戻る。

これらの基本動作は `showModal()` で開いた標準の `dialog` が提供します。閉じる操作はボタンまたは `Escape` を使います。背景をクリックして閉じる処理は追加していません。

## 小さな練習

「ほのお」「番号が大きい順」に変更して `Escape` で閉じ、6・5・4の順になることを確認してください。条件は即時反映するため、`Escape` で閉じても取り消されません。

完成コードは [App.jsx](../../examples/11-filter-modal/src/App.jsx)、[FilterControls.jsx](../../examples/11-filter-modal/src/components/FilterControls.jsx)、[styles.css](../../examples/11-filter-modal/src/styles.css) にあります。

[前へ：第10章 並び替え](10-sort.md) / [次へ：第12章 PokéAPI](12-pokeapi.md)
