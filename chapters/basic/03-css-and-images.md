# 第03章 CSS と画像

この章では、JSON にある画像 URL を使ってポケモンの画像を表示します。その後、CSS を少しずつ追加して図鑑カードの見た目を整えます。

## この章の目標

- 画像 URL を JSX の属性に渡して表示できる
- `className` と CSS のクラスを対応させられる
- 背景、枠線、余白、画像の大きさを変更できる
- 開発者ツールで CSS の効果を調べられる

第02章の完成状態から始めます。完成例は [examples/03-css-and-images/](../../examples/03-css-and-images/) にあります。画像は外部 URL から読み込むため、インターネット接続が必要です。

## ステップ1 画像 URL を読み、画像を表示する

`src/data/pokemon.json` で、フシギダネの `sprites` を探します。画像 URL は次の階層にあります。

```json
{
  "sprites": {
    "other": {
      "official-artwork": {
        "front_default": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png"
      }
    }
  }
}
```

`src/App.jsx` の `const firstType = ...` の次に追加します。

```js
const imageUrl = pokemon.sprites.other['official-artwork'].front_default
```

`official-artwork` はハイフンを含む項目名なので、`['official-artwork']` のように文字列で指定します。ここではクォートが必要です。前章の `[firstType]` は変数の値を使い、今回の `['official-artwork']` は項目名を直接指定しています。

`article` の開始タグのすぐ後ろ、`h2` の前に画像を追加します。

```jsx
<img src={imageUrl} alt={pokemon.nameja} />
```

`src` は画像の場所、`alt` は画像の内容を伝える代替テキストです。この画像ではポケモン名を指定します。画像を読み込めない場合や、画面読み上げを利用する場合にも内容を伝えるための属性です。[MDN：img 要素](https://developer.mozilla.org/ja/docs/Web/HTML/Reference/Elements/img)

属性にも JavaScript の値を使えます。`src={imageUrl}` は変数の値を渡し、`src="imageUrl"` は `imageUrl` という文字列を渡します。[React：JSX の属性に値を渡す](https://ja.react.dev/learn/javascript-in-jsx-with-curly-braces#passing-strings-with-quotes)

**確認：** フシギダネの画像が表示されます。まだ大きくても構いません。次のステップで大きさや配置を整えます。

表示されない場合は、JSON の URL をブラウザで直接開いてみてください。画像そのものを開けるかと、`src` の記述が正しいかを順番に確認します。

## ステップ2 カードの背景と枠を作る

CSS は、ページの要素の見た目を指定するための言語です。要素を選ぶ「セレクター」と、プロパティ・値の組でスタイルを書きます。[MDN：CSS の構文](https://developer.mozilla.org/ja/docs/Web/CSS/Guides/Syntax/Introduction)

JSX の `article` の開始タグに `className` を追加します。

```jsx
<article className="pokemon-card">
```

`className` は、CSS で使うクラス名を付ける属性です。React の JSX では `class` の代わりに `className` を使います。[React：JSX の属性名](https://ja.react.dev/learn/writing-markup-with-jsx#3-camelcase-all-most-of-the-things)

`src/styles.css` の末尾に、次を追加します。もともとある共通スタイルは残します。

```css
.pokemon-card {
  max-width: 320px;
  padding: 24px;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background-color: var(--color-surface);
}
```

`.pokemon-card` は、`pokemon-card` というクラスを持つ要素を選びます。クラスを指定する CSS の先頭には `.` が必要です。`{ }` の中に見た目の指定を書き、各指定の末尾にセミコロンを付けます。

| 指定 | カードへの効果 |
| --- | --- |
| `max-width: 320px` | 幅を最大320ピクセルにする |
| `padding: 24px` | 枠の内側に24ピクセルの余白を作る |
| `border: 1px solid ...` | 細い実線の枠を付ける |
| `border-radius: 16px` | 枠の角を丸める |
| `background-color: ...` | 背景色を指定する |

`var(--color-border)` と `var(--color-surface)` は、同じファイルの `:root` で用意した色を使っています。上部の定義を探すと、枠線の色と白い背景の値を確認できます。

**確認：** 画像と名前を含む部分が、白い背景と丸い枠で囲まれます。ページ全体の淡い背景と、カードの白い背景を見比べてください。

CSS は `src/main.jsx` の `import './styles.css'` ですでに読み込まれています。保存しても変わらない場合は、クラス名のつづりと、編集している CSS ファイルを確認します。

## ステップ3 画像の大きさと配置を整える

画像の開始タグにクラス名を追加します。

```jsx
<img className="pokemon-image" src={imageUrl} alt={pokemon.nameja} />
```

`src/styles.css` の末尾に追加します。

```css
.pokemon-image {
  width: 200px;
  height: 200px;
  margin: 0 auto 16px;
  object-fit: contain;
}
```

`width` と `height` は、画像を表示する領域の幅と高さです。`object-fit: contain` は、画像全体がその領域に収まるように、縦横の比率を保って表示する指定です。[MDN：object-fit](https://developer.mozilla.org/ja/docs/Web/CSS/Reference/Properties/object-fit)

`margin` は要素の外側の余白です。今回の3つの値は「上が0、左右が `auto`、下が16ピクセル」を表します。共通 CSS の `img` は `display: block` になっているため、左右の余白を自動にすると画像の領域がカード内で中央に配置されます。

**確認：** 画像が小さくなり、カードの中央に収まります。画像と名前の間には余白ができます。

一時的に `width` と `height` を両方 `160px` に変え、表示が変わることを確認してください。その後、両方とも `200px` に戻します。

## ステップ4 名前と情報の余白を整える

`src/App.jsx` の `h2`、図鑑番号の `p`、`ul` に、それぞれクラス名を追加します。要素の中の表示内容はそのままです。

```jsx
<h2 className="pokemon-name">{pokemon.nameja}</h2>
<p className="pokemon-number">図鑑番号: {pokemon.id}</p>
<ul className="pokemon-info">
  <li>タイプ: {typeNames[firstType]}</li>
  <li>高さ: {pokemon.height / 10} m</li>
  <li>重さ: {pokemon.weight / 10} kg</li>
</ul>
```

CSS の末尾に追加します。

```css
.pokemon-name {
  margin: 0 0 4px;
  font-size: 24px;
}

.pokemon-number {
  margin: 0 0 16px;
  color: #52637a;
  font-size: 14px;
}

.pokemon-info {
  margin: 0;
  padding-left: 20px;
}
```

`font-size` は文字の大きさ、`color` は文字の色です。ブラウザが最初から付ける余白を `margin` で調整し、名前と番号を近づけ、番号と情報の間を少し空けています。

`padding-left` は、リストの内側の左余白です。箇条書きの記号がカード内に収まるように残しています。

余白には「要素の内側の `padding`」と「外側の `margin`」があります。枠を境目にすると違いを考えやすくなります。[MDN：ボックスモデル](https://developer.mozilla.org/ja/docs/Learn_web_development/Core/Styling_basics/Box_model)

**確認：** 名前が大きく、番号が小さく表示されます。箇条書きの記号がカードの枠からはみ出していないことも確認します。

## ステップ5 開発者ツールで CSS の効果を確かめる

カードを右クリックして「検証」を開き、`article` を選びます。「Styles／スタイル」で `.pokemon-card` を探してください。[Chrome DevTools：CSS の表示と変更](https://developer.chrome.com/docs/devtools/css?hl=ja)

背景色を調べる練習として、開発者ツール上で `background-color` の値を一時的に `#fff3d6` に変更します。

**確認：** カードの背景だけが薄い黄色に変わります。ページを再読み込みすると、CSS ファイルに書かれた白い背景へ戻ります。

開発者ツールでの変更は、その場で見た目を試すためのものです。残したい変更は、エディターで CSS ファイルに書いて保存します。

## ステップ6 完成したカードを確認する

完成した `src/App.jsx` は次の形です。

```jsx
import pokemonList from './data/pokemon.json'
import typeNames from './data/typeNames.ja.json'

export default function App() {
  const pokemon = pokemonList[0]
  const firstType = pokemon.types[0].type.name
  const imageUrl = pokemon.sprites.other['official-artwork'].front_default

  return (
    <main>
      <h1>ポケモン図鑑</h1>
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
    </main>
  )
}
```

CSS の全体は [完成例の styles.css](../../examples/03-css-and-images/src/styles.css) と比較できます。

**確認：** 次の点を確かめてください。

- 名前、番号、画像がすべてフシギダネの情報になっている
- タイプ、高さ、重さがカードの中に表示される
- 画像がつぶれず、カードの中に収まっている
- コンソールにアプリに関するエラーが出ていない

## 小さな練習

`pokemonList[0]` を一時的に `pokemonList[3]` に変更します。名前がヒトカゲ、番号が `4`、タイプが `ほのお`、高さが `0.6 m`、重さが `8.5 kg` になり、画像も切り替わることを確認します。確認後は `[0]` に戻してください。

同じ見た目のまま別の情報を表示できました。次の章では、このカードを独立したコンポーネントにします。

[前へ：第02章 ローカル JSON の利用](02-local-json.md) / [次へ：第04章 コンポーネント](04-components.md)
