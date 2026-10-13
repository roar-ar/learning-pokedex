# 第07章 詳細画面

ポケモンを選ぶと一覧を詳細画面へ切り替え、「一覧に戻る」で戻れるようにします。特性と6種類のステータスも表示します。

## この章の目標

- state の値で表示するコンポーネントを切り替える
- `find` で選択した1匹を探す
- 親から渡した関数で一覧へ戻る
- 配列に入った特性とステータスを表示する

第06章の完成状態から始めます。完成例は [examples/07-detail/](../examples/07-detail/) です。

## ステップ1 詳細の部品を作る

`src/components/PokemonDetail.jsx` を作り、まず画像と名前、番号を表示します。

```jsx
export default function PokemonDetail({ pokemon, onBack }) {
  const imageUrl = pokemon.sprites.other['official-artwork'].front_default

  return (
    <section>
      <button className="back-button" type="button" onClick={onBack} autoFocus>
        一覧に戻る
      </button>
      <article className="pokemon-detail">
        <img className="pokemon-image" src={imageUrl} alt={pokemon.nameja} />
        <h2>{pokemon.nameja}</h2>
        <p>図鑑番号: {pokemon.id}</p>
      </article>
    </section>
  )
}
```

`onBack` は、一覧へ戻る処理を親から受け取る props です。`onClick={onBack}` で、ボタンを押したときに呼び出します。

**確認：** この時点では新しい部品を呼び出していないので、一覧の表示は変わりません。ファイルを保存し、次のステップで接続します。

## ステップ2 選択したポケモンを探して切り替える

`App.jsx` に import を追加します。

```js
import PokemonDetail from './components/PokemonDetail.jsx'
```

state の宣言の後、一覧を返す `return` の前に追加します。

```jsx
const selectedPokemon = pokemonList.find((pokemon) => pokemon.id === selectedId)
if (selectedPokemon) {
  return (
    <main>
      <h1>ポケモン図鑑</h1>
      <PokemonDetail pokemon={selectedPokemon} onBack={() => setSelectedId(null)} />
    </main>
  )
}
```

`find` は、条件に一致する最初の要素を返します。選択した番号がなければ `undefined` になり、`if` の中には入りません。[MDN：Array.find](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/find)

一致した場合は詳細を返し、関数の処理がそこで終わります。それ以外では、後ろにある一覧の `return` へ進みます。[React：条件付きレンダー](https://ja.react.dev/learn/conditional-rendering)

**確認：** カードを選ぶと、一覧が消えてその1匹の詳細になります。「一覧に戻る」を押すと、`selectedId` が `null` になり一覧へ戻ります。URL は変わりません。

詳細のボタンに付けた `autoFocus` により、切り替わったときのキーボード操作は「一覧に戻る」から始められます。

## ステップ3 一覧のボタンを詳細用にする

`App.jsx` の一覧から、選択した番号を表示していた `p` を削除します。カードへ渡す `isSelected` も削除してください。

```jsx
<PokemonCard key={pokemon.id} pokemon={pokemon} onSelect={setSelectedId} />
```

`PokemonCard.jsx` の引数から `isSelected` を削除し、ボタンの `aria-pressed` を削除します。ボタンの文字は `詳細を見る` に変えます。

**確認：** 各カードの「詳細を見る」から、正しい名前と番号の詳細を開けます。押したままの状態を表すボタンではなく、画面を切り替えるボタンになりました。

## ステップ4 タイプと基本情報を追加する

`PokemonDetail.jsx` の先頭で対応表を読み込みます。

```js
import typeNames from '../data/typeNames.ja.json'
```

詳細の図鑑番号の `p` の後ろに追加します。

```jsx
<p>タイプ: {pokemon.types.map((entry) => typeNames[entry.type.name]).join(' / ')}</p>
<h3>基本情報</h3>
<dl className="pokemon-facts">
  <div><dt>高さ</dt><dd>{pokemon.height / 10} m</dd></div>
  <div><dt>重さ</dt><dd>{pokemon.weight / 10} kg</dd></div>
</dl>
```

`dl` は項目と説明の組を並べる要素です。`dt` に項目名、`dd` に対応する値を書きます。[MDN：dl 要素](https://developer.mozilla.org/ja/docs/Web/HTML/Reference/Elements/dl)

`styles.css` の末尾に追加します。

```css
.back-button {
  margin-bottom: 20px;
}

.pokemon-detail {
  max-width: 640px;
  padding: 24px;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background-color: var(--color-surface);
}

.pokemon-facts div,
.pokemon-stats div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border);
}

.pokemon-facts dd,
.pokemon-stats dd {
  margin: 0;
}
```

`display: flex` と `justify-content: space-between` で、項目名と値を左右に配置します。

**確認：** リザードンのタイプが2つ表示され、高さと重さが項目名と対になって表示されます。

## ステップ5 特性を表示する

対応表の import を追加します。

```js
import abilityNames from '../data/abilityNames.ja.json'
```

基本情報の `dl` の後ろに追加します。

```jsx
<h3>特性</h3>
<ul>
  {pokemon.abilities.map((entry) => (
    <li key={entry.ability.name}>
      {abilityNames[entry.ability.name]}
      {entry.is_hidden && '（隠れ特性）'}
    </li>
  ))}
</ul>
```

`条件 && 表示する内容` は、条件が `true` の場合に右側の内容を表示する書き方です。ここでは `is_hidden` が `true` の特性に注記を付けます。

**確認：** フシギダネで「しんりょく」と「ようりょくそ」が表示され、後者に「隠れ特性」の注記が付きます。

## ステップ6 ステータスを表示する

もう1つ対応表を import します。

```js
import statNames from '../data/statNames.ja.json'
```

特性の `ul` の後ろに追加します。

```jsx
<h3>ステータス</h3>
<dl className="pokemon-stats">
  {pokemon.stats.map((entry) => (
    <div key={entry.stat.name}>
      <dt>{statNames[entry.stat.name]}</dt>
      <dd>{entry.base_stat}</dd>
    </div>
  ))}
</dl>
```

`stat.name` はステータスの識別子、`base_stat` は表示する数値です。

**確認：** フシギダネの HP が45、こうげきが49など、6項目が表示されます。ほかのポケモンでも数値が変わることを確かめてください。

## 小さな練習

「一覧に戻る」を `Enter` で押し、別のカードの詳細を開いてください。一覧・詳細の切り替えを決めている値がどれか説明してみましょう。

完成コードは [App.jsx](../examples/07-detail/src/App.jsx) と [PokemonDetail.jsx](../examples/07-detail/src/components/PokemonDetail.jsx) にあります。

[前へ：第06章 クリックと state](06-state.md) / [次へ：第08章 名前検索](08-search.md)
