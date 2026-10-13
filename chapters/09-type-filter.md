# 第09章 タイプ絞り込み

名前検索にタイプの条件を加えます。名前とタイプの両方に一致したポケモンを表示します。

## この章の目標

- 選択欄を state と結び付ける
- `some` で複数あるタイプを調べる
- 条件を `&&` と `||` で組み合わせる

第08章の完成状態から始めます。完成例は [examples/09-type-filter/](../examples/09-type-filter/) です。

## ステップ1 タイプの選択を保持する

`App.jsx` に対応表の import を追加します。

```js
import typeNames from './data/typeNames.ja.json'
```

ほかの state と並べて追加します。

```js
const [selectedType, setSelectedType] = useState('')
```

空文字を、タイプを指定しない状態として使います。名前検索の `label` の後ろ、同じ `filter-controls` の中に追加します。

```jsx
<label className="filter-field" htmlFor="type-filter">
  タイプ
  <select id="type-filter" value={selectedType} onChange={(event) => setSelectedType(event.target.value)}>
    <option value="">すべて</option>
    <option value="grass">くさ</option>
    <option value="fire">ほのお</option>
  </select>
</label>
```

`option` の `value` が state に入る値で、タグの中の文字が表示名です。[React：select](https://ja.react.dev/reference/react-dom/components/select)

**確認：** 選択が切り替わります。この段階では、一覧はまだ変わりません。

## ステップ2 対応表から選択肢を作る

固定で書いた「くさ」と「ほのお」の `option` を、次に置き換えます。「すべて」は残します。

```jsx
{Object.keys(typeNames).map((type) => (
  <option key={type} value={type}>{typeNames[type]}</option>
))}
```

`Object.keys` は、オブジェクトの項目名を配列で返します。英語の識別子を `value` に、日本語名を表示に使います。[MDN：Object.keys](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Object/keys)

**確認：** 対応表のタイプがすべて選択肢になります。今回のポケモンに含まれないタイプもあります。

## ステップ3 どれかのタイプが一致するか調べる

`filter` の中にある名前の条件の後ろに、タイプの条件を追加します。

```js
const matchesType = selectedType === '' || pokemon.types.some((entry) => entry.type.name === selectedType)
```

`some` は、配列の中に条件を満たす要素が1つでもあれば `true` を返します。先頭のタイプだけでなく、2番目のタイプも検索できます。[MDN：Array.some](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/some)

`A || B` はどちらかが成り立つ場合に `true` です。ここでは「すべてが選ばれている」または「タイプが一致する」という条件です。

`return matchesName` を `return matchesType` に一時的に変更します。

**確認：** 「ひこう」を選ぶと、リザードンだけになります。2番目のタイプも調べられています。この時点では、名前の条件は使われなくなっています。

## ステップ4 名前とタイプの両方で絞る

`filter` を次の形にします。

```js
const filteredPokemon = pokemonList.filter((pokemon) => {
  const matchesName = pokemon.nameja.toLowerCase().includes(normalizedQuery)
  const matchesType = selectedType === '' || pokemon.types.some((entry) => entry.type.name === selectedType)
  return matchesName && matchesType
})
```

`A && B` は、両方が成り立つ場合に `true` です。

**確認：** 名前を `リザ`、タイプを「ほのお」にすると2匹になります。タイプを「ひこう」にするとリザードンだけになります。名前を `フシギ` にすると、両方に一致するものがなくなります。

## ステップ5 条件を戻して確認する

名前を空にし、タイプを「すべて」に戻します。

**確認：** 全件が戻ります。名前検索だけ、タイプだけ、両方、0件のそれぞれを試してください。詳細を開いて戻った場合も、選択した条件が維持されます。

## 小さな練習

「どく」で絞ったときにフシギダネが表示される理由を、`pokemon.types` のデータと `some` の処理を見比べて説明してください。

完成コードは [App.jsx](../examples/09-type-filter/src/App.jsx) にあります。

[前へ：第08章 名前検索](08-search.md) / [次へ：第10章 並び替え](10-sort.md)
