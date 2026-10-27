# 第20章 カスタム Hooks

API 取得やブラウザへの保存の処理を、カスタム Hooks に切り出します。コンポーネントから、それぞれの値と操作を利用できるように整理します。

## この章の目標

- state と Effect を使う処理を、役割ごとにまとめる
- API 取得や保存のロジックを、カスタム Hooks に切り出す
- Hook が返す値や関数を、コンポーネントから利用する
- ロジックの再利用と、state の共有の違いを説明する




第19章の完成状態から始めます。完成例は [examples/20-custom-hooks/](../../examples/20-custom-hooks/) です。編集する場所はリポジトリ直下の `src/` です。API の対象は番号1〜10のままです。

## ステップ1 保存する state をカスタム Hook にする

お気に入りとテーマで、初期値の復元と変更後の保存が重複しています。`use` で始まる関数に state と Effect をまとめ、値と更新用の関数を返します。カスタム Hook も、コンポーネントと同様に条件分岐や早期 return より前で呼びます。この Hook は、同じ呼び出しの途中で保存先の key を変更しない使い方を前提にします。

`src/hooks/useStoredState.js` を作成し、次の内容を記述します。

```js
import { useEffect, useState } from 'react'
import { readStoredValue, writeStoredValue } from '../utils/storage.js'

export default function useStoredState(key, initialValue, isValid) {
  const [value, setValue] = useState(() => readStoredValue(key, initialValue, isValid))

  useEffect(() => {
    writeStoredValue(key, value)
  }, [key, value])

  return [value, setValue]
}
```

**確認：** Hook のファイルを作っても、App がまだ使っていないため動作は同じです。戻り値が useState と同じ2要素であることを確認します。

## ステップ2 テーマとお気に入りから保存の重複を取り除く

カスタム Hook が引き受けるのは保存と復元です。テーマを HTML の属性へ反映する処理は、目的が異なるため App に残します。更新関数には引き続き関数を渡せるので、お気に入りの追加・解除の書き方は変わりません。

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
import { readStoredValue, writeStoredValue } from './utils/storage.js'
```

変更後：

```jsx
import useStoredState from './hooks/useStoredState.js'
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
  const [theme, setTheme] = useState(() => readStoredValue('pokedex:theme', 'light', isTheme))

  useEffect(() => {
    writeStoredValue('pokedex:theme', theme)
    document.documentElement.dataset.theme = theme
  }, [theme])
```

変更後：

```jsx
  const [theme, setTheme] = useStoredState('pokedex:theme', 'light', isTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
  const [favoriteIds, setFavoriteIds] = useState(() => readStoredValue('pokedex:favorites', [], isFavoriteIds))

  useEffect(() => {
    writeStoredValue('pokedex:favorites', favoriteIds)
  }, [favoriteIds])
```

変更後：

```jsx
  const [favoriteIds, setFavoriteIds] = useStoredState('pokedex:favorites', [], isFavoriteIds)
```

**確認：** テーマとお気に入りを変更して再読み込みし、抽出前と同じように復元されることを確認します。

## ステップ3 API 取得を別の Hook へ移す

API 取得は読み込み中・進捗・失敗・再試行をまとめて扱っています。関連する state と Effect を1つの Hook に移します。通信中止と sessionStorage の再利用はそのまま残します。Hook は画面の JSX を返さず、表示に必要な値と操作を返します。

`src/hooks/usePokemonList.js` を作成し、次の内容を記述します。

```js
import { useEffect, useState } from 'react'
import { fetchPokemon } from '../api/pokemon.js'

export default function usePokemonList() {
  const [pokemonList, setPokemonList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loadedCount, setLoadedCount] = useState(0)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadPokemon() {
      setLoading(true)
      setError('')
      setLoadedCount(0)
      setPokemonList([])

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
  }, [attempt])

  function retry() {
    setAttempt((previous) => previous + 1)
  }

  return { pokemonList, loading, error, loadedCount, retry }
}
```

**確認：** 新しいファイルに、API の取得だけがまとまっています。次の接続後に通信と再試行を確認します。

## ステップ4 App から値と操作を利用する

オブジェクトの分割代入で Hook が返した値を取り出します。読み込み中や失敗時の表示は App に残るため、データ取得の仕組みを変えても表示側を読みやすく保てます。取得処理から選択番号の更新を外したので、画面の選択と取得の役割も分かれます。

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
import { fetchPokemon } from './api/pokemon.js'
```

変更後：

```jsx
import usePokemonList from './hooks/usePokemonList.js'
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
  const [pokemonList, setPokemonList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loadedCount, setLoadedCount] = useState(0)
  const [attempt, setAttempt] = useState(0)
```

変更後：

```jsx
  const { pokemonList, loading, error, loadedCount, retry } = usePokemonList()
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
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
  }, [attempt])
```

この部分を削除します。

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
onClick={() => setAttempt((previous) => previous + 1)}
```

変更後：

```jsx
onClick={retry}
```

**確認：** 一覧・条件操作・詳細が抽出前と同じように動きます。開発者ツールで API のキャッシュを消し、通信をオフラインにして再読み込みするとエラーと再試行が使えます。確認後はオンラインへ戻してください。

## ステップ5 ロジックの再利用と state の共有を比べる

同じ Hook を2回呼ぶと、それぞれ別の state が作られます。関数を共通化しても値が自動的に共有されるわけではありません。練習用に、異なる保存先を持つ2つのカウンターを表示し、独立して変化することを確かめます。同じ保存キーを使った場合も、この Hook は別の呼び出しへ変更を通知しません。

**確認：** 次の練習を行い、片方だけを増やしてももう一方は変わらないことを確認します。

**予想して確かめる：** App のほかの Hooks と並べて `const [a, setA] = useStoredState("pokedex:practice-a", 0, Number.isInteger)` と `const [b, setB] = useStoredState("pokedex:practice-b", 0, Number.isInteger)` を一時的に追加します。一覧の h1 の直後へ `<button type="button" onClick={() => setA(a + 1)}>A: {a}</button>` と `<button type="button" onClick={() => setB(b + 1)}>B: {b}</button>` を追加して比較します。確認後は4行を削除し、練習用の保存キーも削除してください。

## 小さな練習

useStoredState の復元・保存、usePokemonList の取得・中止・再試行、App の表示の役割を説明してください。お気に入りとテーマの state が別々である理由も、Hook の呼び出し箇所から説明します。

## 完成状態の確認

次の操作を試し、変更した値から表示までの流れを説明してください。各ステップの一時的な変更は元に戻してから次章へ進みます。

- API取得・エラー・再試行・キャッシュ再利用が抽出前と同じように動く。

- お気に入りとテーマの保存・復元が維持される。

- 別々の Hook 呼び出しの state が自動共有されないことを説明できる。

自分のコードをビルドする場合は、リポジトリ直下で実行します。

```sh
npm run build
```

完成例を起動する場合は、次を実行します。

```sh
npm run dev:example -- examples/20-custom-hooks
```

完成コードは [src/](../../examples/20-custom-hooks/src/) にあります。前章の完成例と比べ、追加したファイルと変更した箇所を確認できます。

## 参考資料

- [React：カスタムフックでロジックを再利用する](https://ja.react.dev/learn/reusing-logic-with-custom-hooks)

- [React：フックのルール](https://ja.react.dev/reference/rules/rules-of-hooks)

[前へ：第19章](19-theme.md) / [次へ：第21章](21-children.md)
