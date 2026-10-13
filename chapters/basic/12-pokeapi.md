# 第12章 PokéAPI

一覧と詳細のデータ源を、ローカル JSON から PokéAPI へ切り替えます。API 応答の違いを調べ、通信中・失敗時の表示と再試行を作ります。

## この章の目標

- `fetch` と `async`・`await` で JSON を取得する
- API 応答にない項目を参照したエラーを調べる
- `useEffect` で取得を開始し、不要になった通信を止める
- 1〜10のポケモンを順番に取得し、取得済みデータを再利用する

第11章の完成状態から始めます。完成例は [examples/12-pokeapi/](../../examples/12-pokeapi/) です。インターネット接続が必要です。

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

Effect は React が画面の要素へ変更を反映した後に実行されます。空の依存配列 `[]` により、この取得はコンポーネントを表示し始めたときに行います。Effect 自体を `async` にせず、中に非同期関数を作って呼びます。[React：useEffect](https://ja.react.dev/reference/react/useEffect)

コンポーネント本体に直接 `fetchPokemon` を呼ぶ処理を置くと、入力などによる再レンダーのたびに通信を始めてしまいます。Effect で取得を開始し、受け取ったデータを state に保存することで、表示の計算と通信のタイミングを分けます。

開発中の保存による更新や、コンポーネントの表示し直しでは、Effect が再び実行されることがあります。別のアプリで `StrictMode` を使う場合は、開発時にセットアップとクリーンアップが追加で実行されます。この教材の `main.jsx` は `StrictMode` を使っていません。

**確認：ここではエラーを確認します。** API の応答が入ると、既存の名前検索が `nameja.toLowerCase()` を実行しようとしてエラーになります。コンソールで、`undefined` や `toLowerCase` と、該当するコードの位置を探してください。

`{pokemon.nameja}` を表示するだけなら空の表示になる場合もありますが、存在しない値に文字列のメソッドを呼ぶと例外になります。API の応答と参照する項目名を見比べます。

## ステップ4 名前の参照を修正する

次の3ファイルで、`pokemon.nameja` を `pokemon.name` に変更します。

- `App.jsx`：名前検索の条件
- `components/PokemonCard.jsx`：見出し、画像の代替テキスト、ボタンの名前
- `components/PokemonDetail.jsx`：見出しと画像の代替テキスト

検索は次の形になります。

```js
const matchesName = pokemon.name.toLowerCase().includes(normalizedQuery)
```

変更した3ファイルを保存し、ブラウザを再読み込みします。

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

ここでは、取得処理の中で新しく作った配列へ追加しています。`setPokemonList` に渡した後の state の配列は、直接 `push` で書き換えず、次の更新用に新しい配列を作ります。第10章のコピーして並べ替える考え方と同じです。

ループ内の `await` によって、1匹の取得が終わってから次の取得へ進みます。すべてを集めた後に、1つの配列として state に渡しています。

**確認：** 取得が終わると10匹が表示されます。開発者ツールの Network／ネットワークで、`pokemon/1/` から `pokemon/10/` へのリクエストを確認してください。

Network を開いてから再読み込みし、`pokeapi.co` で絞り込むと、画像への通信と区別しやすくなります。リクエストを選び、Status／ステータスが `200`、Response／レスポンスが JSON であることを確認します。[Chrome DevTools：ネットワーク](https://developer.chrome.com/docs/devtools/network/reference?hl=ja)

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

通信が速くて見えにくい場合は、Network の通信速度設定を「Slow 3G」などへ変更して再読み込みします。確認後は「No throttling／制限なし」に戻してください。

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

ここまでの取得用 Effect 全体は次の形です。`App` の関数内に置き、前の取得用 Effect を置き換えます。`App` 自体が返す JSX と、Effect が返すクリーンアップ関数は、それぞれ別の関数の `return` です。

```js
useEffect(() => {
  const controller = new AbortController()

  async function loadPokemon() {
    setLoading(true)
    setError('')
    setLoadedCount(0)
    setPokemonList([])
    setSelectedId(null)

    try {
      const collected = []
      for (let id = 1; id <= 10; id += 1) {
        const pokemon = await fetchPokemon(id, controller.signal)
        if (controller.signal.aborted) return
        collected.push(pokemon)
        setLoadedCount(collected.length)
      }
      setPokemonList(collected)
    } catch (error) {
      if (!controller.signal.aborted) {
        setError('データを読み込めませんでした。接続を確認して再試行してください。')
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }

  loadPokemon()
  return () => controller.abort()
}, [])
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

更新関数に関数を渡すと、前の値を受け取って次の値を返せます。ここでは試行番号が変わると Effect が再実行されます。

依存配列の値が前回から変わると、Effect が再実行されます。今回は `attempt` が変わるたびに取得を開始するため、`[attempt]` を指定します。名前やタイプの state は取得処理の中では使わず、受け取った一覧を絞り込むときに使っています。

Effect の中で変化する props や state を参照するように変更した場合は、それらも依存配列へ含めます。React が返す state の更新関数は参照が安定しており、依存配列への追加を省略できます。

**確認：** エラー表示には再試行ボタンが出る構造になります。実際の失敗と再試行は、次の保存処理を追加した後で試します。

## ステップ9 保存と復元の関数を作る

PokéAPI は、取得したリソースをローカルでキャッシュするよう求めています。[PokéAPI：Fair Use Policy](https://pokeapi.co/docs/v2#fairuse)

ここでは `sessionStorage` に取得済みデータを保存します。同じタブでの再読み込みでも利用でき、タブを閉じると保存が終了します。[MDN：sessionStorage](https://developer.mozilla.org/ja/docs/Web/API/Window/sessionStorage)

保存できるのは文字列なので、`JSON.stringify` で文字列に変換し、読むときは `JSON.parse` で戻します。開発者ツールのコンソールで、次を1行ずつ試します。

```js
JSON.stringify({ id: 1, name: 'bulbasaur' })
JSON.parse('{"id":1,"name":"bulbasaur"}')
```

**確認：** 最初は JSON 形式の文字列、次は `id` と `name` を持つオブジェクトが返ります。ファイルを import した第02章では Vite が読み込んだ値を使いましたが、今回は自分で文字列とオブジェクトを変換します。

`api/pokemon.js` の既存の `fetchPokemon` より前に、次の2つの関数を追加します。

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
```

`key` は保存先の名前です。`getItem` は保存した文字列を読み、`setItem` は文字列を保存します。まだ保存がなければ `getItem` は `null` を返します。

保存が許可されない環境や、読み取った文字列を解析できない場合にも対応するため、`try` と `catch` を使います。読む処理は `null` を返し、書く処理はアプリを止めずに終わります。

**確認：** 保存します。この時点では2つの関数を呼んでいないので、通信や表示は変わりません。

## ステップ10 必要な項目だけを取り出す

API の応答には、この図鑑で使わない技の一覧なども含まれています。必要な項目を取り出し、表示に使う階層を保ったオブジェクトを作ります。

`api/pokemon.js` の `fetchPokemon` より前に追加します。

```js
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
```

`id: data.id` は、受け取ったオブジェクトの `id` を、新しく作るオブジェクトの `id` に入れる記述です。`types`・`abilities`・`stats` は配列をそのまま受け渡し、`sprites` は必要な画像 URL の階層を作っています。

既存の `fetchPokemon` の `return await response.json()` を、次に置き換えます。`fetch` と `response.ok` の確認は残します。

```js
const data = await response.json()
const pokemon = pickPokemon(data)
writeCache('pokedex:pokemon:' + id, pokemon)
return pokemon
```

`'pokedex:pokemon:' + id` は、文字列と番号をつないで保存先の名前を作ります。番号1なら `pokedex:pokemon:1` です。

**確認：** 再読み込みして取得を終え、コンソールで次を実行します。

```js
JSON.parse(sessionStorage.getItem('pokedex:pokemon:1'))
```

名前やステータス、必要な画像 URL が保存され、`moves` と `nameja` はないことを確かめます。保存が許可されない環境では `null` になる場合がありますが、取得できれば図鑑の表示はできます。

## ステップ11 保存済みなら通信を省く

`fetchPokemon` 全体を次に置き換えます。前のステップで追加した `readCache`・`writeCache`・`pickPokemon` は残します。

```js
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

保存済みのデータがあれば、先にそれを返します。保存がなければ API から取得して保存します。

```text
保存済み？ → ある → 保存したデータを返す
           → ない → API から取得 → 必要な項目を保存 → データを返す
```

**確認：** 一度取得してから再読み込みすると、Pokemon の API リクエストが増えずに一覧が出ます。画像への通信は別なので、Network では `pokeapi.co` の取得を見てください。取得途中で失敗した場合も、成功した分は再試行で利用できます。

保存場所はサイトとタブに結び付いています。開発サーバーのポートを変えたり、別のタブで開いたりした場合は、同じ保存が使えるとは限りません。この教材では保存した値の期限や更新の仕組みは扱わず、取り直したい場合は次の手順で削除します。

## ステップ12 失敗と復旧を試す

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

Network で失敗したリクエストを選ぶと、HTTP ステータスが `404` であることを確認できます。ステップ3の `nameja` のエラーは、通信が成功した後の JavaScript の処理で起きました。画面が動かないときは、通信が失敗したのか、受け取った値を使う処理で失敗したのかを調べましょう。

## 完成状態の確認

- 名前表示と検索が `name` を使っている
- 一覧・詳細とも API 由来の値を表示する
- タイプ・特性・ステータス名は日本語の対応表を使う
- 読み込み中、失敗、再試行の表示がある
- `pokemon.json` の import が残っていない

Effect の全体は [完成例の App.jsx](../../examples/12-pokeapi/src/App.jsx)、取得処理は [pokemon.js](../../examples/12-pokeapi/src/api/pokemon.js) と比較できます。

[前へ：第11章 条件操作のモーダル](11-filter-modal.md) / [次へ：第13章 仕上げ](13-finish.md)
