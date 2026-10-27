# 第24章 QueryString と検索条件

適用済みの検索条件・並び順・ページ番号を、URL の QueryString と対応させます。URL を開いたときや、ブラウザの「戻る・進む」で条件を復元します。

## この章の目標

- URLSearchParams で、条件を文字列へ変換・復元する
- 適用済みの条件とページ番号を、URL に反映する
- 再読み込みや「戻る・進む」に合わせて、表示を更新する
- URL の値が不足している場合や不正な場合に、既定値を使う




第23章の完成状態から始めます。完成例は [examples/24-query-string/](../../examples/24-query-string/) です。編集する場所はリポジトリ直下の `src/` です。API の対象は番号1〜10のままです。

## ステップ1 URL の値を条件へ変換する

URL の ? より後ろを QueryString と呼びます。URLSearchParams は、値の取得と文字列への変換を行うブラウザのAPIです。複数タイプには同じキーを繰り返す `types=fire&types=flying` を使い、getAll で配列として読みます。URL は利用者が直接変更できるため、型や選択肢を確認し、不正な値は既定値へ戻します。

`src/utils/catalogUrl.js` を作成し、次の内容を記述します。

```js
import typeNames from '../data/typeNames.ja.json'
import { copyConditions } from './conditions.js'

const CATALOG_KEYS = ['q', 'types', 'match', 'sort', 'page']

export function readCatalogUrl(search = window.location.search) {
  const params = new URLSearchParams(search)
  const pageText = params.get('page') || '1'
  const parsedPage = /^[1-9]\d*$/.test(pageText) ? Number(pageText) : 1
  const page = Number.isSafeInteger(parsedPage) ? parsedPage : 1
  const conditions = {
    query: (params.get('q') || '').trim(),
    selectedTypes: [...new Set(params.getAll('types').filter((type) => Object.hasOwn(typeNames, type)))],
    typeMatch: params.get('match') === 'all' ? 'all' : 'any',
    sortOrder: params.get('sort') === 'desc' ? 'desc' : 'asc',
  }
  return { conditions, draft: copyConditions(conditions), page }
}

export function encodeCatalog({ conditions, page }) {
  const params = new URLSearchParams()
  if (conditions.query.trim()) params.set('q', conditions.query.trim())
  for (const type of conditions.selectedTypes) params.append('types', type)
  if (conditions.typeMatch === 'all') params.set('match', 'all')
  if (conditions.sortOrder === 'desc') params.set('sort', 'desc')
  if (page > 1) params.set('page', String(page))
  return params
}

export function writeCatalogUrl(state, mode = 'push') {
  const url = new URL(window.location.href)
  for (const key of CATALOG_KEYS) url.searchParams.delete(key)
  for (const [key, value] of encodeCatalog(state)) url.searchParams.append(key, value)
  const target = url.pathname + url.search + url.hash
  const current = window.location.pathname + window.location.search + window.location.hash
  if (target === current) return
  if (mode === 'replace') window.history.replaceState(null, '', target)
  else window.history.pushState(null, '', target)
}
```

**確認：** 次の関数を作成します。まだ App と接続する前なので画面の動作は変わりません。page は正の安全な整数だけ、types は対応表にある識別子だけを受け入れることをコードで確認します。

## ステップ2 条件と URL を相互に変換する

encodeCatalog は既定値を省略し、適用済みの条件だけを文字列にします。set は1つの値を設定し、append は同じキーへ値を追加します。Object.hasOwn は対応表そのものにある項目だけを認めます。正規表現 `/^[1-9]\d*$/` は先頭が1〜9で残りが数字の文字列に一致します。画面のページ上限はデータの件数から決めるため、ここでは正の整数かどうかを確認する段階です。

**確認：** 次の例を開く準備をします。`?q=char&types=fire&sort=desc` は英語名の部分一致とほのおタイプ、番号が大きい順を表します。

**予想して確かめる：** この章の接続が終わった後、初期化の呼び出しを一時的に `useReducer(catalogReducer, undefined, () => readCatalogUrl("?types=fire&types=fire&types=invalid&page=-2"))` に変更して再読み込みします。重複と不正タイプが除かれ、ページ1になることを予想して確かめ、確認後は `useReducer(catalogReducer, undefined, readCatalogUrl)` へ戻してください。

## ステップ3 復元用の action を用意する

ブラウザの戻る・進むでは、URLから復元した状態で適用済み条件・編集用条件・ページをまとめて置き換えます。通常の適用と異なり、URLに保存されたページを維持します。

`src/state/catalogReducer.js` の次の部分を変更します。変更前：

```js
    default:
```

変更後：

```js
    case 'restored':
      return {
        conditions: copyConditions(action.state.conditions),
        draft: copyConditions(action.state.conditions),
        page: action.state.page,
      }
    default:
```

**確認：** restored は状態の復元だけを行い、URLを書き換える副作用は含みません。

## ステップ4 履歴の更新とブラウザ操作への追従をまとめる

pushState は履歴を追加し、replaceState は現在の履歴を置き換えます。どちらもページ全体は再読み込みしません。また、これらの呼び出しだけでは popstate は発生しません。自分の操作では dispatch も行い、ブラウザの戻る・進むでは popstate を購読します。編集中の変更は履歴へ追加しません。

`src/hooks/useCatalogUrl.js` を作成し、次の内容を記述します。

```js
import { useEffect } from 'react'
import { catalogReducer } from '../state/catalogReducer.js'
import { readCatalogUrl, writeCatalogUrl } from '../utils/catalogUrl.js'

export default function useCatalogUrl({ catalog, dispatch, currentPage, loading, error, dialogRef, onNavigate }) {
  const { conditions, page } = catalog

  useEffect(() => {
    function restore() {
      dialogRef.current?.close()
      dispatch({ type: 'restored', state: readCatalogUrl() })
      onNavigate?.(null)
    }
    window.addEventListener('popstate', restore)
    return () => window.removeEventListener('popstate', restore)
  }, [dispatch, dialogRef, onNavigate])

  useEffect(() => {
    if (loading || error) return
    if (page !== currentPage) dispatch({ type: 'page_changed', page: currentPage })
    writeCatalogUrl({ conditions, page: currentPage }, 'replace')
  }, [conditions, page, currentPage, loading, error, dispatch])

  function commit(action) {
    const next = catalogReducer(catalog, action)
    writeCatalogUrl(next, 'push')
    dispatch(action)
  }

  return commit
}
```

**確認：** Hook を作成します。適用・ページ移動は履歴の追加、初期値や範囲外ページの補正は現在の履歴の置換、という役割の違いを確認します。

## ステップ5 初期化と適用・ページ移動を接続する

URL の読み込みは useReducer の初期化関数に渡します。commit は適用とページ移動だけで使い、入力中の dispatch はそのままです。データを読み終えた後で currentPage を使い、URLのページが結果の範囲を超えた場合も補正します。URL同期の Hook も、loading の早期 return より前に置きます。

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
import { catalogReducer, createInitialCatalogState } from './state/catalogReducer.js'
```

変更後：

```jsx
import { catalogReducer } from './state/catalogReducer.js'
import { readCatalogUrl } from './utils/catalogUrl.js'
import useCatalogUrl from './hooks/useCatalogUrl.js'
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
useReducer(catalogReducer, undefined, createInitialCatalogState)
```

変更後：

```jsx
useReducer(catalogReducer, undefined, readCatalogUrl)
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
    dispatch({ type: 'filters_applied' })
```

変更後：

```jsx
    commit({ type: 'filters_applied' })
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
onClick={() => dispatch({ type: 'page_changed', page: currentPage - 1 })}
```

変更後：

```jsx
onClick={() => commit({ type: 'page_changed', page: currentPage - 1 })}
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
onClick={() => dispatch({ type: 'page_changed', page: currentPage + 1 })}
```

変更後：

```jsx
onClick={() => commit({ type: 'page_changed', page: currentPage + 1 })}
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
  if (loading) {
```

変更後：

```jsx
  const commit = useCatalogUrl({ catalog, dispatch, currentPage, loading, error, dialogRef, onNavigate: setSelectedId })

  if (loading) {
```

**確認：** URLに `?q=char&types=fire&sort=desc` を付けて開くと番号6・5・4になります。条件を変えても適用するまでURLは変わりません。適用後に再読み込みすると同じ条件になります。

**予想して確かめる：** 条件をリセットして適用し、2ページ目→3ページ目へ進みます。ブラウザの戻る・進むで2・3ページが復元されることを確認します。`?page=999` は4ページへ、`?q=not-found&page=999` は0件・ページ指定なしへ補正されます。

## 小さな練習

commit の writeCatalogUrl の mode を一時的に replace に変えます。ページを移動してからブラウザの「戻る」を押し、操作ごとの履歴がどう変わるか比較してください。確認後は push に戻します。直接開いたURL、再読み込み、戻る・進むの3通りで同じ条件を再現できる理由を説明してください。

## 完成状態の確認

次の操作を試し、変更した値から表示までの流れを説明してください。各ステップの一時的な変更は元に戻してから次章へ進みます。

- URLを直接開く・再読み込み・戻る・進むで条件とページを復元する。

- 編集中の条件はURLに反映せず、適用とページ移動で履歴を追加する。

- 不正な値や範囲外ページを補正し、0件も表示できる。

自分のコードをビルドする場合は、リポジトリ直下で実行します。

```sh
npm run build
```

完成例を起動する場合は、次を実行します。

```sh
npm run dev:example -- examples/24-query-string
```

完成コードは [src/](../../examples/24-query-string/src/) にあります。前章の完成例と比べ、追加したファイルと変更した箇所を確認できます。

## 参考資料

- [MDN：URLSearchParams](https://developer.mozilla.org/ja/docs/Web/API/URLSearchParams)

- [MDN：履歴 API の操作](https://developer.mozilla.org/ja/docs/Web/API/History_API/Working_with_the_History_API)

- [MDN：popstate](https://developer.mozilla.org/ja/docs/Web/API/Window/popstate_event)

[前へ：第23章](23-context.md) / [次へ：第25章](25-detail-url.md)
