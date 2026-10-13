# 第05章 一覧の作成

配列に入ったすべてのポケモンをカードとして並べます。タイプも先頭の1件だけでなく、複数ある場合はすべて表示します。

## この章の目標

- `map` で配列の各要素から表示を作る
- 一覧に `key` を付ける
- CSS Grid でカードを並べる

第04章の完成状態から始めます。完成例は [examples/05-list/](../../examples/05-list/) です。

## ステップ1 配列からカードを作る

`map` は、配列の各要素を関数へ渡し、返された値を新しい配列にまとめます。[MDN：Array.map](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/map)

`App.jsx` の `const pokemon = pokemonList[0]` を削除します。1つだけあった `<PokemonCard ... />` を次に置き換えます。

```jsx
<div className="pokemon-list">
  {pokemonList.map((pokemon) => (
    <PokemonCard key={pokemon.id} pokemon={pokemon} />
  ))}
</div>
```

`(pokemon) => (...)` は **アロー関数** です。`pokemon` に順番に1匹分のデータが入り、丸括弧の中の JSX を返します。

ここでの `pokemon` は `map` の関数が受け取る引数です。前の章の `const pokemon = pokemonList[0]` を削除しても、各カードに渡す値はこの引数から取れます。`map` は元の配列の要素数や順番を変えません。

```text
1匹分のデータ → PokemonCard
次のデータ    → PokemonCard
次のデータ    → PokemonCard
```

**確認：** フシギダネからキャタピーまで、10匹のカードが表示されます。まだ縦に並んでいても構いません。

## ステップ2 key の役割を確認する

`key={pokemon.id}` は、React が一覧の各要素を識別するための指定です。同じ一覧の中で重複せず、並び順が変わっても同じ要素を識別できる値を使います。[React：リストのレンダー](https://ja.react.dev/learn/rendering-lists)

今回のデータには、ポケモンごとに異なる `id` があります。配列の位置やランダムな数を使う代わりに、これを指定します。

**確認：** `key` が `map` から返す `PokemonCard` に付いていることを確認します。コンソールに key に関する警告が出ていないか見てください。

`key` は React が使う特別な指定で、子の props としては読み取れません。子で番号が必要な場合は、渡した `pokemon.id` を使います。

## ステップ3 カードを並べる

`src/styles.css` の末尾に追加します。

```css
.pokemon-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}
```

`display: grid` は、子要素を行と列で配置する指定です。今回は列の幅を最低240ピクセルにし、入る列数を画面幅に合わせて変えます。`gap` はカード同士の間隔です。[MDN：CSS Grid の基本](https://developer.mozilla.org/ja/docs/Web/CSS/CSS_grid_layout/Basic_concepts_of_grid_layout)

**確認：** 広い画面では複数列になり、ブラウザの幅を狭くすると列数が減ります。

## ステップ4 複数のタイプを表示する

`PokemonCard.jsx` の `const firstType = ...` を削除し、タイプの行を置き換えます。

```jsx
<li>タイプ: {pokemon.types.map((entry) => typeNames[entry.type.name]).join(' / ')}</li>
```

`map` で各タイプを日本語名に変えると、フシギダネの場合は `['くさ', 'どく']` という配列になります。`join(' / ')` は、それらを ` / ` でつないだ1つの文字列にします。

**確認：** フシギダネは `くさ / どく`、リザードンは `ほのお / ひこう` と表示されます。タイプが1つのポケモンには、余分な区切り文字が付かないことも確認します。

## 小さな練習

カードの `gap` を一時的に `8px` へ変更してください。カードの内側の余白と、カード同士の間隔が別の指定であることを確認し、`20px` に戻します。

完成コードは [App.jsx](../../examples/05-list/src/App.jsx)、[PokemonCard.jsx](../../examples/05-list/src/components/PokemonCard.jsx)、[styles.css](../../examples/05-list/src/styles.css) にあります。

[前へ：第04章 コンポーネント](04-components.md) / [次へ：第06章 クリックと state](06-state.md)
