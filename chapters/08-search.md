# 第08章 名前検索

入力した文字を名前に含むポケモンを表示します。検索結果は元のデータと検索文字から計算します。

## この章の目標

- 入力欄の値を state と結び付ける
- `filter` と `includes` で検索する
- 件数と結果なしの表示を作る

第07章の完成状態から始めます。完成例は [examples/08-search/](../examples/08-search/) です。

## ステップ1 名前の入力欄を作る

`App.jsx` の一覧を返す部分で、`h1` の後ろに追加します。

```jsx
<div className="filter-controls">
  <label className="filter-field" htmlFor="name-search">
    名前
    <input id="name-search" type="search" />
  </label>
</div>
```

`label` は入力欄の説明です。`htmlFor` と入力の `id` を同じ値にすると対応が付き、ラベルを押しても入力欄へ移動できます。

**確認：** 入力できることを確認します。この時点では、文字を入れても一覧は変わりません。

## ステップ2 入力を state に保持する

`App` の関数の先頭で、`selectedId` と並べて追加します。Hooks は、条件分岐や `return` より前に置きます。

```js
const [query, setQuery] = useState('')
```

入力を次に置き換えます。

```jsx
<input
  id="name-search"
  type="search"
  value={query}
  onChange={(event) => setQuery(event.target.value)}
/>
```

`value` が表示する値、`onChange` が入力時の処理です。`event.target.value` で新しい文字列を読み、state を更新します。このように React の値で入力を管理するものを制御された入力と呼びます。[React：input](https://ja.react.dev/reference/react-dom/components/input)

**確認：** 入力と削除ができます。`value` だけ指定すると入力を変更できなくなるため、`onChange` も付けてください。

## ステップ3 検索結果を計算する

state の宣言の後、詳細への切り替え処理より前に追加します。

```js
const normalizedQuery = query.trim().toLowerCase()
const filteredPokemon = pokemonList.filter((pokemon) => {
  const matchesName = pokemon.nameja.toLowerCase().includes(normalizedQuery)
  return matchesName
})
```

`trim` は前後の空白を取り除き、`toLowerCase` は英字を小文字にします。`includes` は、その文字列を含むかどうかを `true` または `false` で返します。[MDN：String.includes](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/includes)

`filter` は、関数が `true` を返す要素だけを集めます。アロー関数の本体を `{ }` で書く場合は、`return` で結果を返します。[MDN：Array.filter](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)

一覧の `pokemonList.map(...)` を `filteredPokemon.map(...)` に変更します。

**確認：** `フシギ` と入力すると3匹になります。入力を空にすると、空文字はすべての名前に含まれるため、全件が表示されます。カタカナとひらがなの変換はしていないので、`ふしぎ` では一致しません。

検索結果を別の state に保存する必要はありません。検索文字が変わって再表示されるたび、元データから計算できます。[React：そのエフェクトは不要かも](https://ja.react.dev/learn/you-might-not-need-an-effect)

## ステップ4 件数と結果なしを表示する

入力欄の後ろ、カードの一覧の前に追加します。

```jsx
<p className="result-summary" role="status">{filteredPokemon.length}匹が見つかりました</p>
{filteredPokemon.length === 0 && <p>条件に一致するポケモンはいません。</p>}
```

配列の `length` は要素数です。

**確認：** `ピカチュウ` と入力すると、今回のデータには含まれないため0件の案内が出ます。入力を消すと一覧が戻ります。

## ステップ5 入力欄の見た目を整える

`styles.css` の末尾に追加します。

```css
.filter-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 16px;
  margin: 20px 0;
}

.filter-field {
  display: grid;
  flex: 1 1 160px;
  gap: 4px;
  min-width: 0;
}

input,
select {
  width: 100%;
  min-width: 0;
  padding: 10px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: inherit;
  background-color: var(--color-surface);
}
```

`flex-wrap: wrap` は、今後入力欄が増えた場合に、入り切らないものを次の行へ送る指定です。`select` は次の章から使います。

**確認：** 入力の文字と枠が読みやすく、ラベルとの間に余白ができます。

## 小さな練習

`フシギ` で検索し、フシギソウの詳細を開いて戻ります。検索文字と3件の一覧が維持されることを確認してください。検索の state を持つ `App` は、詳細を表示している間も同じコンポーネントとして残っています。

完成コードは [App.jsx](../examples/08-search/src/App.jsx) にあります。

[前へ：第07章 詳細画面](07-detail.md) / [次へ：第09章 タイプ絞り込み](09-type-filter.md)
