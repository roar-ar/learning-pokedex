# 第12章 PokéAPI

一覧と詳細のデータ源を、ローカル JSON から PokéAPI へ切り替えます。API 応答の違いを調べ、通信中・失敗時の表示と再試行を作ります。

## この章の目標

- `fetch` と `async`・`await` で JSON を取得する
- API 応答にない項目を参照したエラーを調べる
- `useEffect` で取得を開始し、不要になった通信を止める
- 1〜10のポケモンを順番に取得し、取得済みデータを再利用する

第11章の完成状態から始めます。完成例は [examples/12-pokeapi/](../examples/12-pokeapi/) です。インターネット接続が必要です。

## ステップ1 API の応答を見る

API は、プログラムからデータなどを利用するための窓口です。ブラウザで [番号1の Pokemon エンドポイント](https://pokeapi.co/api/v2/pokemon/1/) を開き、JSON の `id`、`name`、`types`、`stats`、`sprites` を探します。

**確認：** `name` は `bulbasaur` です。`nameja` をページ内検索しても見つかりません。ローカル JSON にある項目が、API にもあるとは限りません。[PokéAPI：Pokemon](https://pokeapi.co/docs/v2#pokemon)

一覧のエンドポイントは名前と詳細 URL が中心です。この章では、画面に必要な画像やステータスもある `/pokemon/{id}/` を使います。

## ステップ2 JSON を取得する関数を作る

`src/api/` を作り、その中に `pokemon.js` を作ります。

```js
export async function fetchPokemon(id, signal) {
  const response = await fetch('https://pokeapi.co/api/v2/pokemon/' + id + '/', { signal })
  if (!response.ok) throw new Error('HTTP ' + response.status)
  return await response.json()
}
```

`async` を付けた関数では `await` を使えます。`fetch` が返す Promise は、後で通信の結果が決まることを表す値です。`await` はその結果を待ってから、関数内の次の処理へ進めます。画面全体の操作を止めるものではありません。

`fetch` の結果は Response オブジェクトです。`response.json()` も非同期で、応答本文を JavaScript の値へ変換します。HTTP の404などは `fetch` 自体の失敗としては扱われないため、`response.ok` も確認しています。[MDN：Fetch API の使用](https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch)

`throw new Error(...)` は、メッセージを持つエラーを発生させる記述です。失敗した後の表示は、後のステップで `catch` を使って作ります。

`signal` は、後のステップで通信を中止するために渡す値です。今は省略して呼べます。

ここでは `export default` ではなく、名前付きの `export` を使っています。次のステップの `import { fetchPokemon } ...` は、それに対応する読み込み方です。波括弧内の名前を、定義した名前と合わせます。

**確認：** ファイルを保存します。まだ関数を呼んでいないため、画面の表示は変わりません。

## ステップ3 ローカル JSON を外して1匹取得する

`App.jsx` の `pokemon.json` の import を削除します。React の import に `useEffect` を追加し、取得関数を読み込みます。

```js
import { useEffect, useRef, useState } from 'react'
import { fetchPokemon } from './api/pokemon.js'
```

ほかの Hooks と並べて、取得した配列を保持します。

```js
const [pokemonList, setPokemonList] = useState([])
```

その後に追加します。

```js
useEffect(() => {
  async function loadFirstPokemon() {
    const pokemon = await fetchPokemon(1)
    setPokemonList([pokemon])
  }
  loadFirstPokemon()
}, [])
```

Effect は表示が反映された後に実行されます。空の依存配列 `[]` により、この取得は通常、コンポーネントを表示し始めたときに行います。Effect 自体を `async` にせず、中に非同期関数を作って呼びます。[React：useEffect](https://ja.react.dev/reference/react/useEffect)

**確認：ここではエラーを確認します。** API の応答が入ると、既存の名前検索が `nameja.toLowerCase()` を実行しようとしてエラーになります。コンソールで、`undefined` や `toLowerCase` と、該当するコードの位置を探してください。

`{pokemon.nameja}` を表示するだけなら空の表示になる場合もありますが、存在しない値に文字列のメソッドを呼ぶと例外になります。API の応答と参照する項目名を見比べます。

## ステップ4 名前の参照を修正する

次の3ファイルで、`pokemon.nameja` を `pokemon.name` に変更します。

- `App.jsx`：名前検索の条件
- `components/PokemonCard.jsx`：見出しと画像の代替テキスト
- `components/PokemonDetail.jsx`：見出しと画像の代替テキスト

検索は次の形になります。

```js
const matchesName = pokemon.name.toLowerCase().includes(normalizedQuery)
```

**確認：** `bulbasaur` のカードが表示され、詳細も開けます。検索欄で `BULBA` と入力しても一致します。この章以降、名前表示と名前検索は英語名です。タイプ・特性・ステータスの対応表は引き続き使います。

以降の処理では `pokemon.json` を参照しません。ローカルデータから日本語名を補う処理も追加しません。

## ステップ5 順番に10匹取得する

検索欄を空に戻します。Effect を次に置き換えます。

```js
useEffect(() => {
  async function loadPokemon() {
    const collected = []
    for (let id = 1; id <= 10; id += 1) {
      const pokemon = await fetchPokemon(id)
      collected.push(pokemon)
    }
    setPokemonList(collected)
  }
  loadPokemon()
}, [])
```

`for` は、初期値・繰り返す条件・1回ごとの更新を指定します。`let` は値を更新する変数に使います。ここでは `id` を1から10まで増やします。`push` は配列の末尾へ値を追加します。

| 記述 | 意味 |
| --- | --- |
| `let id = 1` | 1から始める |
| `id <= 10` | id が10以下の間、繰り返す |
| `id += 1` | 1回の処理の後に id を1増やす |

`collected` は `const` ですが、配列の中身を `push` で追加することはできます。`const` が防ぐのは、その変数へ別の配列を入れ直すことです。

ループ内の `await` によって、1匹の取得が終わってから次の取得へ進みます。すべてを集めた後に、1つの配列として state に渡しています。

**確認：** 取得が終わると10匹が表示されます。開発者ツールの Network／ネットワークで、`pokemon/1/` から `pokemon/10/` へのリクエストを確認してください。

## ステップ6 通信中と失敗時の表示を作る

Hooks に次を追加します。

```js
const [loading, setLoading] = useState(true)
const [error, setError] = useState('')
const [loadedCount, setLoadedCount] = useState(0)
```

取得関数の中を次の形にします。Effect の外側は前のステップと同じです。

```js
async function loadPokemon() {
  setLoading(true)
  setError('')
  setLoadedCount(0)
  setPokemonList([])
  setSelectedId(null)

  try {
    const collected = []
    for (let id = 1; id <= 10; id += 1) {
      const pokemon = await fetchPokemon(id)
      collected.push(pokemon)
      setLoadedCount(collected.length)
    }
    setPokemonList(collected)
  } catch (error) {
    setError('データを読み込めませんでした。接続を確認して再試行してください。')
  } finally {
    setLoading(false)
  }
}
```

`try` の途中でエラーが起きると `catch` へ進みます。`finally` は成功・失敗のどちらでも最後に実行されます。

`App` の詳細画面への切り替えより前に追加します。Hooks の宣言と Effect は、これらの `return` より前に置いてください。

```jsx
if (loading) {
  return (
    <main>
      <h1>ポケモン図鑑</h1>
      <p role="status">読み込み中… {loadedCount} / 10</p>
    </main>
  )
}

if (error) {
  return (
    <main>
      <h1>ポケモン図鑑</h1>
      <p role="alert">{error}</p>
    </main>
  )
}
```

**確認：** 再読み込みすると「読み込み中」が表示され、その後に一覧へ切り替わります。`role="alert"` はエラーの案内を伝えるための指定です。

## ステップ7 不要になった通信を止める

通信が終わる前に画面を離れたり、Effect が再実行されたりした場合は、前の処理が後から表示を更新しないようにします。[MDN：AbortController](https://developer.mozilla.org/ja/docs/Web/API/AbortController)

Effect の先頭に `const controller = new AbortController()` を追加します。取得には `controller.signal` を渡し、取得直後に中止されていないか確認します。

```js
const pokemon = await fetchPokemon(id, controller.signal)
if (controller.signal.aborted) return
collected.push(pokemon)
```

`catch` と `finally` も変更します。

```js
} catch (error) {
  if (!controller.signal.aborted) {
    setError('データを読み込めませんでした。接続を確認して再試行してください。')
  }
} finally {
  if (!controller.signal.aborted) setLoading(false)
}
```

`!` は真偽を反転する記号です。中止に伴う失敗は、ユーザーへ通信エラーとして表示しません。

Effect の `loadPokemon()` の呼び出しの後ろで、クリーンアップ関数を返します。

```js
return () => controller.abort()
```

**確認：** 通常の読み込みが動きます。クリーンアップは Effect が再実行される前や、コンポーネントが取り除かれるときに実行されます。ブラウザ上の再読み込みでは、ページ自体も通信を中止します。

## ステップ8 再試行できるようにする

Hooks に追加します。

```js
const [attempt, setAttempt] = useState(0)
```

取得する Effect の最後の依存配列を `[]` から `[attempt]` に変えます。失敗時の `p` の後ろにボタンを追加します。

```jsx
<button type="button" onClick={() => setAttempt((previous) => previous + 1)}>再試行</button>
```

更新関数に関数を渡すと、前の値を受け取って次の値を返せます。ここでは試行番号が変わると Effect が再実行されます。名前やタイプの入力で通信をやり直す必要はないため、それらをこの取得の依存配列に入れる必要はありません。

**確認：** エラー表示には再試行ボタンが出る構造になります。実際の失敗と再試行は、次の保存処理を追加した後で試します。

## ステップ9 取得済みの値を保存する

PokéAPI は、取得したリソースをローカルでキャッシュするよう求めています。[PokéAPI：Fair Use Policy](https://pokeapi.co/docs/v2#fairuse)

ここでは `sessionStorage` に取得済みデータを保存します。同じタブでの再読み込みでも利用でき、タブを閉じると保存が終了します。[MDN：sessionStorage](https://developer.mozilla.org/ja/docs/Web/API/Window/sessionStorage)

`api/pokemon.js` 全体を次に置き換えます。

```js
function readCache(key) {
  try {
    const value = sessionStorage.getItem(key)
    return value === null ? null : JSON.parse(value)
  } catch {
    return null
  }
}

function writeCache(key, pokemon) {
  try {
    sessionStorage.setItem(key, JSON.stringify(pokemon))
  } catch {
    // 保存できない環境でも、取得したデータは表示に使えます。
  }
}

function pickPokemon(data) {
  return {
    id: data.id,
    name: data.name,
    height: data.height,
    weight: data.weight,
    types: data.types,
    abilities: data.abilities,
    stats: data.stats,
    sprites: {
      other: {
        'official-artwork': {
          front_default: data.sprites.other['official-artwork'].front_default,
        },
      },
    },
  }
}

export async function fetchPokemon(id, signal) {
  const cacheKey = 'pokedex:pokemon:' + id
  const cached = readCache(cacheKey)
  if (cached) return cached

  const response = await fetch('https://pokeapi.co/api/v2/pokemon/' + id + '/', { signal })
  if (!response.ok) throw new Error('HTTP ' + response.status)
  const data = await response.json()
  const pokemon = pickPokemon(data)
  writeCache(cacheKey, pokemon)
  return pokemon
}
```

保存できるのは文字列なので、`JSON.stringify` で文字列に変換し、読むときは `JSON.parse` で戻します。`pickPokemon` は必要な項目だけを取り出し、大きな技の一覧などを保存しないようにしています。表示に使う階層は保っています。

**確認：** 一度取得してから再読み込みすると、Pokemon の API リクエストが増えずに一覧が出ます。画像への通信は別なので、Network では `pokeapi.co` の取得を見てください。取得途中で失敗した場合も、成功した分は再試行で利用できます。

## ステップ10 失敗と復旧を試す

キャッシュがあると通信しないため、開発者ツールのコンソールでこの教材のキャッシュだけを削除します。

```js
for (let id = 1; id <= 10; id += 1) {
  sessionStorage.removeItem('pokedex:pokemon:' + id)
}
```

`api/pokemon.js` の取得 URL を、一時的に存在しない番号0へ変えます。

```js
const response = await fetch('https://pokeapi.co/api/v2/pokemon/0/', { signal })
```

再読み込みします。

**確認：** エラーの案内と「再試行」が表示されます。取得 URL を元に戻して保存し、必要なら再試行ボタンを押します。読み込みを経て一覧が戻ることを確認してください。

## 完成状態の確認

- 名前表示と検索が `name` を使っている
- 一覧・詳細とも API 由来の値を表示する
- タイプ・特性・ステータス名は日本語の対応表を使う
- 読み込み中、失敗、再試行の表示がある
- `pokemon.json` の import が残っていない

Effect の全体は [完成例の App.jsx](../examples/12-pokeapi/src/App.jsx)、取得処理は [pokemon.js](../examples/12-pokeapi/src/api/pokemon.js) と比較できます。

[前へ：第11章 条件操作のモーダル](11-filter-modal.md) / [次へ：第13章 仕上げ](13-finish.md)
