# 第22章 useReducer

条件の適用・リセット・ページ移動に伴う state の更新を、useReducer で整理します。操作ごとに、次の状態を作る処理をまとめます。

## この章の目標

- 関連する state の更新を、useReducer にまとめる
- 条件の適用・リセット・ページ移動を、action で表す
- 元の state を書き換えず、次の state を返す reducer を作る
- コンポーネントから dispatch を使って操作を伝える




第21章の完成状態から始めます。完成例は [examples/22-reducer/](../../examples/22-reducer/) です。編集する場所はリポジトリ直下の `src/` です。API の対象は番号1〜10のままです。

## ステップ1 関連する状態の初期値をまとめる

条件の適用には、適用済み条件・編集中の条件・ページ番号の更新が伴います。これらを1つの状態として扱います。お気に入りやテーマ、API の読み込み状態は別の役割なので、この reducer には含めません。

`src/state/catalogReducer.js` を作成し、次の内容を記述します。

```js
import { createDefaultConditions, copyConditions } from '../utils/conditions.js'

export function createInitialCatalogState() {
  return { conditions: createDefaultConditions(), draft: createDefaultConditions(), page: 1 }
}

export function catalogReducer(state, action) {
  switch (action.type) {
    case 'filters_opened':
      return { ...state, draft: copyConditions(state.conditions) }
    case 'draft_changed':
      return { ...state, draft: { ...state.draft, ...action.changes } }
    case 'type_toggled': {
      const types = state.draft.selectedTypes
      const selectedTypes = types.includes(action.value)
        ? types.filter((value) => value !== action.value)
        : [...types, action.value]
      return { ...state, draft: { ...state.draft, selectedTypes } }
    }
    case 'draft_reset':
      return { ...state, draft: createDefaultConditions() }
    case 'filters_cancelled':
      return { ...state, draft: copyConditions(state.conditions) }
    case 'filters_applied':
      return { ...state, conditions: copyConditions(state.draft), page: 1 }
    case 'page_changed':
      return { ...state, page: Math.max(1, action.page) }
    default:
      throw new Error('未対応の操作: ' + action.type)
  }
}
```

**確認：** 初期状態は条件未指定・ページ1です。編集中の条件と適用済み条件が別のオブジェクトで作られることを確認します。

## ステップ2 操作を action で表す

reducer は現在の state と action から次の state を返す関数です。`switch` は action.type に応じて処理を選び、`case` の return で結果を返します。type_toggled の `{ ... }` は、その case の変数の範囲を区切ります。reducer の中では元の state を書き換えず、通信・保存・DOM操作も行いません。

**確認：** filters_applied が条件の反映とページ1への移動を同時に返すこと、draft_reset が適用済み条件を変えないことをコードで追います。

## ステップ3 useState を useReducer へ置き換える

useReducer も現在の値と更新の依頼を返します。更新は setState の代わりに dispatch へ action を渡します。第3引数の初期化関数は最初の状態を作ります。次のステップまで一続きで変更し、古い setter の参照をすべて置き換えます。

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
import { useEffect, useRef, useState } from 'react'
```

変更後：

```jsx
import { useEffect, useReducer, useRef, useState } from 'react'
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
import { createDefaultConditions, copyConditions } from './utils/conditions.js'
```

変更後：

```jsx
import { catalogReducer, createInitialCatalogState } from './state/catalogReducer.js'
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
  const [page, setPage] = useState(1)
```

この部分を削除します。

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
  const [conditions, setConditions] = useState(createDefaultConditions)
  const [draft, setDraft] = useState(createDefaultConditions)
```

変更後：

```jsx
  const [catalog, dispatch] = useReducer(catalogReducer, undefined, createInitialCatalogState)
  const { conditions, draft, page } = catalog
```

**確認：** 初期化の戻り値から conditions・draft・page を取り出す構造になっています。操作の接続は次のステップで完了します。

## ステップ4 イベントから dispatch する

開閉のDOM操作はイベントハンドラに残し、状態を変える意図を action として reducer に伝えます。複数の setter を呼んでいた処理が、操作ごとの dispatch にまとまります。

`src/App.jsx` の次の部分を変更します。変更前：

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

変更後：

```jsx
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
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
onCancel={() => setDraft(copyConditions(conditions))}
```

変更後：

```jsx
onCancel={() => dispatch({ type: 'filters_cancelled' })}
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
onQueryChange={(value) => setDraft((previous) => ({ ...previous, query: value }))}
```

変更後：

```jsx
onQueryChange={(value) => dispatch({ type: 'draft_changed', changes: { query: value } })}
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
onTypeMatchChange={(value) => setDraft((previous) => ({ ...previous, typeMatch: value }))}
```

変更後：

```jsx
onTypeMatchChange={(value) => dispatch({ type: 'draft_changed', changes: { typeMatch: value } })}
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
onSortChange={(value) => setDraft((previous) => ({ ...previous, sortOrder: value }))}
```

変更後：

```jsx
onSortChange={(value) => dispatch({ type: 'draft_changed', changes: { sortOrder: value } })}
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
onClick={() => setPage(currentPage - 1)}
```

変更後：

```jsx
onClick={() => dispatch({ type: 'page_changed', page: currentPage - 1 })}
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
onClick={() => setPage(currentPage + 1)}
```

変更後：

```jsx
onClick={() => dispatch({ type: 'page_changed', page: currentPage + 1 })}
```

**確認：** 条件の適用・キャンセル・編集中のリセット・ページ移動が前章と同じ結果になります。適用は先頭へ戻り、キャンセルはページを維持します。

**予想して確かめる：** filters_applied の page を一時的に2へ変えます。6匹以上になる条件を適用すると2ページ目になることを予想して確認し、page: 1 に戻してください。

## ステップ5 更新前の値が変わらないことを確かめる

reducer が返す次の state は新しいオブジェクトです。変更しない項目はそのまま参照できますが、変更するオブジェクトや配列はコピーします。初期状態をコピーせずに直接変更すると、戻る操作や別の処理が参照する値まで変わる可能性があります。

**確認：** 条件を編集してキャンセルした後も、適用済みの条件が元のままであることを確認します。

**予想して確かめる：** 一時的に filters_cancelled の戻り値を `{ ...state, draft: createDefaultConditions() }` に変えます。キャンセル直後に開き直す場合は filters_opened が適用済み条件をコピーするため表示が同じになることを確認し、両 action の役割を説明して元へ戻してください。

## 小さな練習

「入力を変えた」「タイプを切り替えた」「適用した」「ページを変えた」を、それぞれどの action が表すか説明します。お気に入りをこの reducer に含めなかった理由も説明してください。

## 完成状態の確認

次の操作を試し、変更した値から表示までの流れを説明してください。各ステップの一時的な変更は元に戻してから次章へ進みます。

- 入力・タイプ変更・リセットが編集中の条件だけを更新する。

- 適用で条件とページ1が同時に更新され、キャンセルはページを維持する。

- ページ移動、テーマ、お気に入り、API取得が維持される。

自分のコードをビルドする場合は、リポジトリ直下で実行します。

```sh
npm run build
```

完成例を起動する場合は、次を実行します。

```sh
npm run dev:example -- examples/22-reducer
```

完成コードは [src/](../../examples/22-reducer/src/) にあります。前章の完成例と比べ、追加したファイルと変更した箇所を確認できます。

## 参考資料

- [React：state ロジックをリデューサに抽出する](https://ja.react.dev/learn/extracting-state-logic-into-a-reducer)

- [React：useReducer](https://ja.react.dev/reference/react/useReducer)

[前へ：第21章](21-children.md) / [次へ：第23章](23-context.md)
