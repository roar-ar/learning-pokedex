# 第04章 コンポーネント

第03章のカードを `PokemonCard` という部品に分けます。完成時の見た目は同じですが、表示するデータを親から渡せるようになります。

## この章の目標

- コンポーネントを別ファイルに分ける
- `import` と `export default` で部品を使う
- props でポケモンの情報を渡す

第03章の完成状態から始めます。完成例は [examples/04-components/](../examples/04-components/) です。

## ステップ1 カードを別ファイルに移す

`src/components/` を作り、その中に `PokemonCard.jsx` を作ります。コンポーネント名は大文字から始めます。[React：コンポーネントのインポートとエクスポート](https://ja.react.dev/learn/importing-and-exporting-components)

まず、先頭の1匹を表示するカードを作ります。

```jsx
import pokemonList from '../data/pokemon.json'
import typeNames from '../data/typeNames.ja.json'

export default function PokemonCard() {
  const pokemon = pokemonList[0]
  const firstType = pokemon.types[0].type.name
  const imageUrl = pokemon.sprites.other['official-artwork'].front_default

  return (
    <article className="pokemon-card">
      <img className="pokemon-image" src={imageUrl} alt={pokemon.nameja} />
      <h2 className="pokemon-name">{pokemon.nameja}</h2>
      <p className="pokemon-number">図鑑番号: {pokemon.id}</p>
      <ul className="pokemon-info">
        <li>タイプ: {typeNames[firstType]}</li>
        <li>高さ: {pokemon.height / 10} m</li>
        <li>重さ: {pokemon.weight / 10} kg</li>
      </ul>
    </article>
  )
}
```

ファイルを `components/` に移したため、データのパスは `../data/` になります。`..` は1つ上のフォルダーを表します。

`src/App.jsx` 全体を次に置き換えます。

```jsx
import PokemonCard from './components/PokemonCard.jsx'

export default function App() {
  return (
    <main>
      <h1>ポケモン図鑑</h1>
      <PokemonCard />
    </main>
  )
}
```

**確認：** 第03章と同じカードが表示されます。`App` の中の `<PokemonCard />` が、別ファイルに書いたカードを表示しています。

## ステップ2 親からデータを渡す

部品を組み立てる `App` を親、呼び出される `PokemonCard` を子と呼びます。親から子へ渡す値が **props** です。[React：コンポーネントに props を渡す](https://ja.react.dev/learn/passing-props-to-a-component)

`App.jsx` でデータを読み込み、カードへ渡します。

```jsx
import pokemonList from './data/pokemon.json'
import PokemonCard from './components/PokemonCard.jsx'

export default function App() {
  const pokemon = pokemonList[0]

  return (
    <main>
      <h1>ポケモン図鑑</h1>
      <PokemonCard pokemon={pokemon} />
    </main>
  )
}
```

`pokemon={pokemon}` の左側は props の名前、右側は渡す値です。ここではオブジェクト全体を渡しています。

子の `PokemonCard.jsx` は、先頭の `pokemonList` の import と `const pokemon = pokemonList[0]` を削除し、関数の定義を変更します。

```jsx
export default function PokemonCard({ pokemon }) {
```

`({ pokemon })` は、受け取った props オブジェクトから `pokemon` を取り出す「分割代入」です。`const firstType` と `const imageUrl`、`return` の内容は残します。

**確認：** 保存後も同じカードが表示されます。ポケモンを選ぶ処理は親に、1匹を表示する処理は子に置けました。

## ステップ3 同じ部品に別のデータを渡す

`App.jsx` の `pokemonList[0]` を一時的に `[3]` へ変えます。

**確認：** `PokemonCard.jsx` を変更せず、ヒトカゲのカードが表示されます。確認後は `[0]` に戻してください。

子の中で `pokemon.nameja = ...` のように受け取った値を書き換えることはしません。表示するデータは親で選び、子は props を読んで表示します。

## ステップ4 ファイルのつながりを確認する

```text
App.jsx
  ├─ pokemon.json を読み、表示対象を選ぶ
  └─ PokemonCard に pokemon を渡す
       └─ 名前・画像・数値を表示する
```

**確認：** `PokemonCard.jsx` には `pokemonList[0]` がなく、`App.jsx` にはカードの `article` がないことを確かめます。CSS のクラス名は同じなので、見た目も引き続き共通スタイルで指定できます。

## 小さな練習

`App.jsx` に一時的に `<PokemonCard pokemon={pokemonList[3]} />` をもう1つ追加してください。2匹を同じ部品で表示できることを確認し、追加した1行を戻します。

完成コードは [App.jsx](../examples/04-components/src/App.jsx) と [PokemonCard.jsx](../examples/04-components/src/components/PokemonCard.jsx) で確認できます。

[前へ：第03章 CSS と画像](03-css-and-images.md) / [次へ：第05章 一覧の作成](05-list.md)
