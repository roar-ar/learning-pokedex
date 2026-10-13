# 第02章 ローカル JSON の利用

この章では、直接書いていたポケモンの情報を、JSON ファイルの値に置き換えます。1か所の選択を変えるだけで、別のポケモンの情報を表示できるようにします。

## この章の目標

- JSON を読み込み、配列の先頭のデータを取り出せる
- オブジェクトから名前や数値を読める
- JSX の `{ }` で値や計算結果を表示できる
- タイプ名の対応表から日本語の表示名を取り出せる

第01章の完成状態から始めます。完成例は [examples/02-local-json/](../examples/02-local-json/) にあります。

## ステップ1 JSON の形を確かめる

JSON は、データを文字で表す形式です。このリポジトリでは、ポケモンの情報を `src/data/pokemon.json` に保存しています。[MDN：JSON の操作](https://developer.mozilla.org/ja/docs/Learn_web_development/Core/Scripting/JSON)

ファイルをエディターで開いてください。先頭の情報から、使う項目だけ抜き出すと次の形です。これは説明用の抜粋なので、実際の JSON ファイルはそのまま使います。

```json
[
  {
    "id": 1,
    "name": "bulbasaur",
    "nameja": "フシギダネ",
    "height": 7,
    "weight": 69
  },
  {
    "id": 2,
    "name": "ivysaur",
    "nameja": "フシギソウ",
    "height": 10,
    "weight": 130
  }
]
```

`[ ]` は複数の値を順番に並べた **配列**、`{ }` は項目名と値を組にした **オブジェクト** を表します。ここでは、1匹分が1つのオブジェクトで、それらを配列に並べています。

`"id": 1` は、項目名 `id` の値が数値の `1` という意味です。`"nameja": "フシギダネ"` の値は文字列です。JSON の項目名や文字列はダブルクォートで囲み、項目や要素の間はカンマで区切ります。

JSON ファイルにはコメントを書けず、最後の項目や要素の後ろにもカンマを付けられません。後の章に出てくる JavaScript のオブジェクトとは、この点が異なります。[MDN：JSON](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/JSON)

**確認：** 実際のファイルで `id`、`nameja`、`height`、`weight` を探します。先頭の情報がフシギダネであることを確認してください。

## ステップ2 先頭の名前と図鑑番号を表示する

`import` は、別のファイルの内容を読み込む記述です。Vite では JSON ファイルを直接 `import` できます。読み込んだ値を JavaScript の配列やオブジェクトとして扱えるため、ここでは文字列を自分で解析する処理は書きません。[Vite：JSON](https://vite.dev/guide/features.html#json)

`src/App.jsx` 全体を次のようにします。

```jsx
import pokemonList from './data/pokemon.json'

export default function App() {
  const pokemon = pokemonList[0]

  return (
    <main>
      <h1>ポケモン図鑑</h1>
      <article>
        <h2>{pokemon.nameja}</h2>
        <p>図鑑番号: {pokemon.id}</p>
        <ul>
          <li>タイプ: くさ</li>
          <li>高さ: 0.7 m</li>
          <li>重さ: 6.9 kg</li>
        </ul>
      </article>
    </main>
  )
}
```

`./data/pokemon.json` の `./` は、いま書いている `App.jsx` があるフォルダーを基準にするという意味です。

`const pokemon = pokemonList[0]` では、配列の先頭の値を `pokemon` という名前で使えるようにしています。配列の位置は **0から数えます**。`[0]` が1番目、`[1]` が2番目です。[MDN：配列](https://developer.mozilla.org/ja/docs/Learn_web_development/Core/Scripting/Arrays)

`const` は値に名前を付けるための記述です。同じ名前へ別の値を入れ直すことはできません。ここでは、表示対象の1匹を読みやすい名前で参照します。[MDN：const](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Statements/const)

`pokemon.nameja` のドットは、オブジェクトの項目を読む記法です。JSX の `{pokemon.nameja}` は、その項目の値を画面に表示します。クォートで囲まずに `{ }` を使う点に注目してください。[React：JSX に波括弧で JavaScript を含める](https://ja.react.dev/learn/javascript-in-jsx-with-curly-braces)

**確認：** 名前と番号は第01章と同じ表示になります。コード上では、この2つが直接書いた文字から JSON の値に変わっています。タイプ、高さ、重さはまだ直接書いた状態です。

## ステップ3 高さと重さをデータから表示する

JSON の `height` はデシメートル、`weight` はヘクトグラムの値です。メートルとキログラムで表示するには、どちらも10で割ります。[PokéAPI：Pokemon の項目](https://pokeapi.co/docs/v2#pokemon)

`ul` の中の高さと重さの行を置き換えます。

```jsx
<li>高さ: {pokemon.height / 10} m</li>
<li>重さ: {pokemon.weight / 10} kg</li>
```

`/` は割り算です。JSX の `{ }` には項目の値だけでなく、計算式も書けます。単位の `m` と `kg` は、計算式の外側に文字として置いています。

**確認：** フシギダネの高さは `0.7 m`、重さは `6.9 kg` になります。JSON の `7` と `69` がそのまま表示されていないことを確かめてください。

## ステップ4 階層のあるデータを読む

JSON ファイルで `types` を探します。フシギダネの部分は次の形です。

```json
{
  "types": [
    {
      "slot": 1,
      "type": {
        "name": "grass",
        "url": "https://pokeapi.co/api/v2/type/12/"
      }
    },
    {
      "slot": 2,
      "type": {
        "name": "poison",
        "url": "https://pokeapi.co/api/v2/type/4/"
      }
    }
  ]
}
```

タイプの情報も配列に入っています。この章では、先頭のタイプを表示します。`const pokemon = pokemonList[0]` の次の行に追加してください。

```js
const firstType = pokemon.types[0].type.name
```

左から順番に読むと、次のようになります。

| 記述 | 取り出すもの |
| --- | --- |
| `pokemon.types` | そのポケモンのタイプの配列 |
| `pokemon.types[0]` | 先頭のタイプの情報 |
| `pokemon.types[0].type` | その中にある `type` のオブジェクト |
| `pokemon.types[0].type.name` | タイプの識別子 `grass` |

タイプの行を次に置き換えます。

```jsx
<li>タイプ: {firstType}</li>
```

**確認：** `タイプ: grass` と表示されます。JSON の階層をたどって、先頭のタイプを取得できています。

## ステップ5 対応表で日本語のタイプ名にする

`src/data/typeNames.ja.json` を開き、`"grass": "くさ"` を探してください。このファイルは、タイプの識別子を日本語の表示名に対応させたオブジェクトです。

`src/App.jsx` の先頭で、ポケモンの JSON を読み込む行の下に追加します。

```js
import typeNames from './data/typeNames.ja.json'
```

次に、タイプの行を置き換えます。

```jsx
<li>タイプ: {typeNames[firstType]}</li>
```

`typeNames[firstType]` は、`firstType` の値を項目名として使う記述です。`firstType` が `grass` なら、`typeNames` の `grass` に対応する値を読みます。[MDN：オブジェクトのブラケット記法](https://developer.mozilla.org/ja/docs/Learn_web_development/Core/Scripting/Object_basics#ブラケット記法)

**確認：** `タイプ: くさ` に変わります。`typeNames.firstType` と書くと、`firstType` という名前の項目を探してしまうため、ここでは `[firstType]` を使います。

## ステップ6 別のポケモンに切り替えて確認する

ここまでの `src/App.jsx` を確認します。

```jsx
import pokemonList from './data/pokemon.json'
import typeNames from './data/typeNames.ja.json'

export default function App() {
  const pokemon = pokemonList[0]
  const firstType = pokemon.types[0].type.name

  return (
    <main>
      <h1>ポケモン図鑑</h1>
      <article>
        <h2>{pokemon.nameja}</h2>
        <p>図鑑番号: {pokemon.id}</p>
        <ul>
          <li>タイプ: {typeNames[firstType]}</li>
          <li>高さ: {pokemon.height / 10} m</li>
          <li>重さ: {pokemon.weight / 10} kg</li>
        </ul>
      </article>
    </main>
  )
}
```

`pokemonList[0]` を、一時的に `pokemonList[1]` に変更します。

**確認：** フシギソウ、図鑑番号 `2`、タイプ `くさ`、高さ `1 m`、重さ `13 kg` に変わります。1行の変更で複数の表示が変わるのは、同じ `pokemon` の情報を読んでいるためです。

確認後は `pokemonList[0]` に戻してください。

## 小さな練習

名前の表示を、一時的に `{pokemon.nameja}` から `{pokemon.name}` に変更してみましょう。`bulbasaur` と表示されることを確認し、`nameja` に戻します。項目名によって取り出す値が変わることを確かめてください。

うまく表示されない場合は、次を確認します。

| 状態 | 確認すること |
| --- | --- |
| JSON の読み込みに失敗する | `import` のパスとファイル名が合っているか |
| 名前が表示されない | `nameja` のつづりが合っているか |
| オブジェクトを表示できないというエラーが出る | `{pokemon}` ではなく、文字列や数値の項目を指定しているか |
| 配列の位置を変えたらエラーになる | 存在する位置を指定しているか。最初は `[0]` に戻して確認する |

[前へ：第01章 JSX](01-jsx.md) / [次へ：第03章 CSS と画像](03-css-and-images.md)
