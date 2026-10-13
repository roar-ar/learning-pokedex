# 第10章 並び替え

検索・絞り込みの結果を、図鑑番号が小さい順または大きい順に並べます。元の配列を変えずに表示順を作ります。

## この章の目標

- 並び順を state に保持する
- 配列をコピーしてから `sort` する
- 比較関数の返す数値と順序の関係を理解する

第09章の完成状態から始めます。完成例は [examples/10-sort/](../examples/10-sort/) です。

## ステップ1 並び順を選ぶ

`App` の state に追加します。

```js
const [sortOrder, setSortOrder] = useState('asc')
```

`asc` を小さい順、`desc` を大きい順を表す値として使います。タイプの選択欄の後ろ、同じ `filter-controls` の中に追加します。

```jsx
<label className="filter-field" htmlFor="sort-order">
  並び順
  <select id="sort-order" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
    <option value="asc">図鑑番号が小さい順</option>
    <option value="desc">図鑑番号が大きい順</option>
  </select>
</label>
```

**確認：** 選択を変更できます。まだカードの並び順は変わりません。

## ステップ2 コピーした配列を並べる

`filteredPokemon` を作った直後に追加します。

```js
const sortedPokemon = [...filteredPokemon].sort((a, b) => a.id - b.id)
```

`[...filteredPokemon]` は、配列の要素を新しい配列へ展開する記述です。この場合は、配列の入れ物をコピーしてから並べます。各ポケモンのオブジェクトは同じものを参照します。[MDN：スプレッド構文](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/Spread_syntax)

`sort` は呼び出した配列そのものの順番を変更します。そのため、ここではコピーを使います。比較関数 `(a, b) => a.id - b.id` は、a の番号が小さいと負の数になり、a を先に置く指定です。[MDN：Array.sort](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)

一覧の `filteredPokemon.map(...)` を `sortedPokemon.map(...)` に変えます。件数と0件の判定の `filteredPokemon.length` も、`sortedPokemon.length` に変えてください。

**確認：** 番号が1から順に並びます。タイプで絞った場合も、残ったカードの番号が小さい順になります。

## ステップ3 大きい順に対応する

比較関数を選択した順序で切り替えます。

```js
const sortedPokemon = [...filteredPokemon].sort((a, b) => (
  sortOrder === 'asc' ? a.id - b.id : b.id - a.id
))
```

`b.id - a.id` にすると、番号が大きいものを先に置きます。同じ値なら比較結果は0です。

**確認：** 大きい順では先頭がキャタピーの番号10、小さい順ではフシギダネの番号1になります。切り替えても件数は変わりません。

## ステップ4 条件を組み合わせて確かめる

名前を空にし、タイプを「ほのお」、並び順を「大きい順」にします。

**確認：** 番号6、5、4の順になります。詳細を開いて戻っても、選択した条件と並び順が維持されます。

処理の順番をコードで追います。

```text
元データ → 名前・タイプで filter → コピーして sort → map でカードを表示
```

元データや表示結果を state に複製するのではなく、変更できる条件だけを state に持っています。

## 小さな練習

名前を `フシギ` にして小さい順・大きい順を切り替えてください。次にすべての条件を戻し、全件の順序が正しく戻ることを確認します。

完成コードは [App.jsx](../examples/10-sort/src/App.jsx) にあります。

[前へ：第09章 タイプ絞り込み](09-type-filter.md) / [次へ：第11章 条件操作のモーダル](11-filter-modal.md)
