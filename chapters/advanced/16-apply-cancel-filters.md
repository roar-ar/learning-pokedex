# 第16章 条件の適用とキャンセル

モーダルで条件を変更し、「適用」を押した時点で一覧へ反映します。キャンセルした場合は、変更前の条件と表示を維持します。

## この章の目標

- 編集中の条件と適用済みの条件を、別々に管理する
- モーダルを開くときに、適用済みの条件を編集用の値へコピーする
- 適用した条件で一覧を更新し、先頭のページへ戻す
- キャンセルや Escape で閉じたときに、編集した条件を取り消す




第15章の完成状態から始めます。完成例は [examples/16-apply-cancel-filters/](../../examples/16-apply-cancel-filters/) です。編集する場所はリポジトリ直下の `src/` です。API の対象は番号1〜10のままです。

## ステップ1 条件の初期値を1つの関数にまとめる

名前・タイプ・一致方法・並び順を1つのオブジェクトで扱います。初期値の関数は、呼ぶたびに新しいオブジェクトと配列を返します。`...conditions` はオブジェクトの項目を展開する記法です。配列もコピーし、編集用と適用済みを分けます。

`src/utils/conditions.js` を作成し、次の内容を記述します。

```js
export function createDefaultConditions() {
  return { query: '', selectedTypes: [], typeMatch: 'any', sortOrder: 'asc' }
}

export function copyConditions(conditions) {
  return { ...conditions, selectedTypes: [...conditions.selectedTypes] }
}
```

**確認：** 新しいファイルを保存しても、まだ動作は変わりません。初期値とコピーの関数が何を返すかコードで確認します。

## ステップ2 編集用と適用済みの state を分ける

`conditions` は一覧に適用する条件、`draft` はモーダルで編集中の条件です。state の初期化に関数を渡すと、初期値が必要なときに React が呼びます。`const { query, ... } = conditions` の形はオブジェクトの分割代入です。既存の絞り込みの計算は、この適用済みの値を使い続けます。

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
import typeNames from './data/typeNames.ja.json'
```

変更後：

```jsx
import typeNames from './data/typeNames.ja.json'
import { createDefaultConditions, copyConditions } from './utils/conditions.js'
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
  const [query, setQuery] = useState('')
  const [selectedTypes, setSelectedTypes] = useState([])
  const [typeMatch, setTypeMatch] = useState('any')
  const [sortOrder, setSortOrder] = useState('asc')
```

変更後：

```jsx
  const [conditions, setConditions] = useState(createDefaultConditions)
  const [draft, setDraft] = useState(createDefaultConditions)
  const { query, selectedTypes, typeMatch, sortOrder } = conditions
```

**確認：** このステップと次のステップは入力の接続を切り替える一続きの変更です。古い更新関数の参照を残さないよう、次のステップまで保存してから操作します。

## ステップ3 開く・適用する・取り消す操作を作る

`setDraft(previous => ({ ...previous, query: value }))` のように、変えない項目をコピーして必要な項目だけ上書きします。丸括弧で囲んだオブジェクトは、アロー関数が返す値です。適用したときだけ条件とページを更新します。キャンセルは編集中の値を捨てます。

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
  function toggleType(type) {
    setPage(1)
    setSelectedTypes((previous) => (
      previous.includes(type)
        ? previous.filter((value) => value !== type)
        : [...previous, type]
    ))
  }

  function resetConditions() {
    setPage(1)
    setQuery('')
    setSelectedTypes([])
    setTypeMatch('any')
    setSortOrder('asc')
  }
```

変更後：

```jsx
  function openFilters() {
    setDraft(copyConditions(conditions))
    dialogRef.current.showModal()
  }

  function toggleType(type) {
    setDraft((previous) => ({
      ...previous,
      selectedTypes: previous.selectedTypes.includes(type)
        ? previous.selectedTypes.filter((value) => value !== type)
        : [...previous.selectedTypes, type],
    }))
  }

  function applyFilters() {
    setConditions(copyConditions(draft))
    setPage(1)
    dialogRef.current.close()
  }

  function cancelFilters() {
    setDraft(copyConditions(conditions))
    dialogRef.current.close()
  }

  function resetConditions() {
    setDraft(createDefaultConditions())
  }
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
onClick={() => dialogRef.current.showModal()}
```

変更後：

```jsx
onClick={openFilters}
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
<dialog className="filters-dialog" ref={dialogRef} aria-labelledby="filters-title">
```

変更後：

```jsx
<dialog className="filters-dialog" ref={dialogRef} aria-labelledby="filters-title" onCancel={() => setDraft(copyConditions(conditions))}>
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
        <FilterControls
          query={query}
          onQueryChange={(value) => { setQuery(value); setPage(1) }}
          selectedTypes={selectedTypes}
          onTypeToggle={toggleType}
          typeMatch={typeMatch}
          onTypeMatchChange={(value) => { setTypeMatch(value); setPage(1) }}
          sortOrder={sortOrder}
          onSortChange={(value) => { setSortOrder(value); setPage(1) }}
        />
        <p role="status">{sortedPokemon.length}匹が見つかりました</p>
```

変更後：

```jsx
        <FilterControls
          query={draft.query}
          onQueryChange={(value) => setDraft((previous) => ({ ...previous, query: value }))}
          selectedTypes={draft.selectedTypes}
          onTypeToggle={toggleType}
          typeMatch={draft.typeMatch}
          onTypeMatchChange={(value) => setDraft((previous) => ({ ...previous, typeMatch: value }))}
          sortOrder={draft.sortOrder}
          onSortChange={(value) => setDraft((previous) => ({ ...previous, sortOrder: value }))}
        />
        <p>「適用」を押すと一覧に反映されます。</p>
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
          <button type="button" onClick={() => dialogRef.current.close()}>条件を閉じる</button>
```

変更後：

```jsx
          <button type="button" onClick={cancelFilters}>キャンセル</button>
          <button type="button" onClick={applyFilters}>適用</button>
```

**確認：** モーダルで名前を CHAR にしてキャンセルすると一覧は元のままです。開き直すと入力も元の条件です。適用すると3匹になり、ページは先頭へ戻ります。

**予想して確かめる：** 4ページ目でモーダルを開き、条件を変えてキャンセルします。ページが4のままであることを確認します。同じ変更を適用した場合との違いを説明してください。

## ステップ4 リセットと Escape の意味を確認する

リセットは編集中の条件だけを初期値に戻します。リセット後も、適用するまでは一覧は変わりません。`dialog` の `cancel` イベントは Escape などの取り消し要求で発生します。ここでは既定の閉じる動作を妨げず、編集用の条件だけを復元しています。

**確認：** 条件を適用した後、開き直してリセット→キャンセルと操作すると元の条件が残ります。リセット→適用なら全件に戻ります。チェックボックスにフォーカスして Escape で閉じた場合も、条件とページは維持されます。

## 小さな練習

絞り込みで使う分割代入の元を一時的に `conditions` から `draft` に変えます。モーダルで名前を変えると、適用前から背景の一覧と件数が変わる理由を説明してください。キャンセル後には元へ戻ることも確認し、分割代入の元を `conditions` に戻してください。

## 完成状態の確認

次の操作を試し、変更した値から表示までの流れを説明してください。各ステップの一時的な変更は元に戻してから次章へ進みます。

- 編集中は一覧が変わらず、適用すると条件が反映され先頭ページへ戻る。

- キャンセル・チェックボックスからの Escape は、適用済み条件とページを維持する。

- リセットは編集中の条件だけを戻し、適用するまで一覧へ反映しない。

自分のコードをビルドする場合は、リポジトリ直下で実行します。

```sh
npm run build
```

完成例を起動する場合は、次を実行します。

```sh
npm run dev:example -- examples/16-apply-cancel-filters
```

完成コードは [src/](../../examples/16-apply-cancel-filters/src/) にあります。前章の完成例と比べ、追加したファイルと変更した箇所を確認できます。

## 参考資料

- [React：state 内のオブジェクトの更新](https://ja.react.dev/learn/updating-objects-in-state)

- [MDN：dialog の cancel イベント](https://developer.mozilla.org/ja/docs/Web/API/HTMLDialogElement/cancel_event)

[前へ：第15章](15-pagination.md) / [次へ：第17章](17-stat-chart.md)
