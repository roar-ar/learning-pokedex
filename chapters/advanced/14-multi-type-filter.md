# 第14章 複数タイプの絞り込み

タイプを複数選び、名前検索と組み合わせて一覧を絞り込みます。「選んだタイプのいずれかに一致」と「すべてに一致」の違いも扱います。

## この章の目標

- チェックボックスの選択を配列の state に保持する
- 選択したタイプを、元の配列を書き換えずに追加・削除する
- 「いずれか一致」と「すべて一致」の条件を使い分ける
- 名前検索と複数タイプの条件を組み合わせる

第13章の完成状態から始めます。完成例は [examples/14-multi-type-filter/](../../examples/14-multi-type-filter/) です。API の対象は引き続き番号1〜10で、名前検索には英語名を使います。

この章では、タイプを1つ選ぶ欄をチェックボックスに変えます。タイプを選ばなければ全件を対象にし、選んだ場合は「いずれかに一致」を初期値にします。条件は変更した時点で一覧に反映します。

## ステップ1 配列に選択を保持する

まずは「くさ」だけの練習用チェックボックスを作ります。既存のタイプ選択は残したまま、新しい操作で配列が変わることを確かめます。

`src/App.jsx` のほかの state と並べて追加します。既存の `selectedType` は、ステップ3で削除するまで残してください。

```js
const [selectedTypes, setSelectedTypes] = useState([])
```

これまでの `selectedType` は、`'grass'` など1つの文字列でした。新しい `selectedTypes` は、`['grass', 'fire']` のように、選んだタイプを並べる配列です。最初の `[]` は何も選んでいない状態です。

`App` の関数内、`resetConditions` の前に追加します。

```js
function toggleType(type) {
  setSelectedTypes((previous) => (
    previous.includes(type)
      ? previous.filter((value) => value !== type)
      : [...previous, type]
  ))
}
```

`toggle` はオンとオフを切り替える操作です。更新関数に渡した関数は、前の配列 `previous` から次の配列を作ります。

| 記述 | 役割 |
| --- | --- |
| `previous.includes(type)` | すでに選んでいるか調べる |
| `previous.filter((value) => value !== type)` | 選択済みなら、そのタイプを除いた新しい配列を作る |
| `[...previous, type]` | 未選択なら、前の配列を展開し、末尾に追加した新しい配列を作る |

`includes` は値が含まれていれば `true` を返します。`!==` は等しくないことを調べます。第10章の配列のコピーと同じく、`...` は配列の中身を展開する記法です。今回はコピーと同時に、新しい値を末尾に追加します。

state の配列を `push` や `splice` で直接変更せず、新しい配列を更新関数へ渡します。[React：state 内の配列の更新](https://ja.react.dev/learn/updating-arrays-in-state)

モーダルの `<h2 id="filters-title">` の直後、`FilterControls` より前に、練習用の表示を追加します。

```jsx
<label className="type-option">
  <input
    type="checkbox"
    checked={selectedTypes.includes('grass')}
    onChange={() => toggleType('grass')}
  />
  くさ（配列の練習）
</label>
<p>選択した値: {selectedTypes.join(' / ') || 'なし'}</p>
```

チェックボックスは `value` ではなく、真偽値の `checked` で選択状態を指定します。操作されたら `onChange` で親の state を更新します。`label` で囲むと、文字を押してもチェックを切り替えられます。[React：input](https://ja.react.dev/reference/react-dom/components/input)

`styles.css` の末尾に、次の CSS を追加します。この章の完成状態でも使います。

```css
.type-options {
  flex: 1 1 100%;
  min-width: 0;
  margin: 0;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.type-options-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 12px;
}

.type-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-option input {
  flex: 0 0 auto;
  width: auto;
  padding: 0;
  accent-color: var(--color-accent);
}
```

共通 CSS の `input` には `width: 100%` があるため、チェックボックスは幅を `auto` に戻します。`accent-color` はチェックの色です。`repeat(2, minmax(0, 1fr))` は、次のステップで使うタイプの一覧を同じ幅の2列に並べます。

**確認：** モーダルを開き、練習用の「くさ」を選ぶと `grass`、外すと「なし」になります。何度選び直しても `grass / grass` にはなりません。新しい配列はまだ絞り込みに使っていないため、一覧はこの操作では変わりません。

**変えて確かめる：** 練習用の JSX の2か所の `'grass'` を `'fire'` に、文字を「ほのお（配列の練習）」に変えます。ページを再読み込みして操作し、選択した値が `fire` になることを確認してください。次のステップでは、この練習用の `label` と `p` を削除します。

## ステップ2 すべてのタイプをチェックボックスにする

`src/components/FilterControls.jsx` を変更します。まず引数の行を次に置き換えます。

```jsx
export default function FilterControls({
  query, onQueryChange,
  selectedTypes, onTypeToggle,
  sortOrder, onSortChange,
}) {
```

既存の「タイプ」の `label` 全体を、次に置き換えます。名前検索と並び順の `label` は残します。

```jsx
<fieldset className="type-options">
  <legend>タイプ（未選択ならすべて）</legend>
  <div className="type-options-grid">
    {Object.keys(typeNames).map((type) => (
      <label className="type-option" key={type}>
        <input
          type="checkbox"
          checked={selectedTypes.includes(type)}
          onChange={() => onTypeToggle(type)}
        />
        {typeNames[type]}
      </label>
    ))}
  </div>
</fieldset>
```

第09章で選択肢を作った `Object.keys(typeNames).map(...)` を使い、今度はチェックボックスを作っています。`fieldset` は関連する入力をまとめ、`legend` はそのまとまりの見出しになります。[MDN：fieldset](https://developer.mozilla.org/ja/docs/Web/HTML/Reference/Elements/fieldset)

`App.jsx` の `FilterControls` で、`selectedType` と `onTypeChange` の2行を、次の2行に置き換えます。

```jsx
selectedTypes={selectedTypes}
onTypeToggle={toggleType}
```

ステップ1で追加した練習用の `label` と「選択した値」の `p` は削除します。タイプの入力欄が新しい部品へ移ったためです。

**確認：** 対応表の全21タイプが2列に並びます。「ほのお」と「ひこう」を両方選び、一方を外しても、もう一方のチェックは残ります。この段階では新しい選択は一覧や現在の条件の表示にはまだ反映されません。

## ステップ3 いずれかに一致するポケモンを表示する

配列の選択を、一覧の条件へつなげます。`App.jsx` の `filter` の中にある `matchesType` の行を、次に置き換えます。

```js
const matchesType = selectedTypes.length === 0 || selectedTypes.some((type) => (
  pokemon.types.some((entry) => entry.type.name === type)
))
```

外側の `some` は「選んだタイプのうち、1つでも一致するか」、内側の `some` は「このポケモンが、そのタイプを持っているか」を調べます。第09章の、2番目のタイプも調べる考え方を組み合わせています。

```text
選んだタイプ: ['fire', 'flying']
  fire   → このポケモンに fire がある？
  flying → このポケモンに flying がある？
いずれかが true なら、タイプの条件を満たす
```

`selectedTypes.length === 0` は、タイプを何も選ばなければ対象を絞らないための条件です。名前との組み合わせは、引き続き `return matchesName && matchesType` にします。

ここで古い state の `const [selectedType, setSelectedType] = useState('')` を削除します。`resetConditions` の `setSelectedType('')` は、次に置き換えます。

```js
setSelectedTypes([])
```

現在の条件を表示する `p` 全体も置き換えます。

```jsx
<p className="current-conditions">
  名前: {query.trim() || '指定なし'} ／ タイプ: {selectedTypes.length === 0 ? 'すべて' : selectedTypes.map((type) => typeNames[type]).join(' / ')} ／ 並び順: {sortOrder === 'asc' ? '小さい順' : '大きい順'}
</p>
```

配列の各識別子を日本語名へ変換してから、`join` で1つの文字列にしています。`selectedType`・`setSelectedType`・`onTypeChange` という古い名前の参照が残っていないことも確認してください。

**確認：** 条件をリセットしてから「ほのお」と「ひこう」を選ぶと、番号4・5・6の3匹になります。リザードンが両方に一致しても、カードが2枚になることはありません。`filter` は各ポケモンを残すかどうかを判断するためです。

**予想して確かめる：** 「ほのお」を外し、「ひこう」だけにすると何匹になるでしょうか。操作して、番号6の1匹になることを確認します。さらに「ひこう」を外すと10匹に戻ります。

## ステップ4 some を every に変えて比較する

次は、いったんコードを変えて違いを調べます。`matchesType` の**外側の** `selectedTypes.some` だけを、`selectedTypes.every` に変えます。内側の `pokemon.types.some` は残します。

```js
const matchesType = selectedTypes.length === 0 || selectedTypes.every((type) => (
  pokemon.types.some((entry) => entry.type.name === type)
))
```

`every` は、配列のすべての要素が条件を満たす場合に `true` を返します。ここでは「選んだタイプを全部持つポケモン」だけになります。「全ポケモンが同じタイプか」を調べているわけではありません。[MDN：Array.every](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/every)

**予想して確かめる：** 名前は空、並び順は小さい順にして、次を試します。

| 選んだタイプ | 変更前の some | 変更後の every |
| --- | --- | --- |
| ほのお・ひこう | 番号4・5・6 | 番号6 |
| ほのお・みず | 番号4・5・6・7・8・9 | 0匹 |
| くさ・どく | 番号1・2・3 | 番号1・2・3 |

最後の組み合わせで件数が同じになる理由も、詳細画面のタイプと見比べて説明してください。今回の1〜10では、くさタイプの3匹が、いずれもどくタイプを持っています。

確認後は外側を `some` に戻します。次のステップで、コードを編集せずに一致方法を選べるようにします。

## ステップ5 一致方法を画面から切り替える

`App.jsx` の `selectedTypes` の state の直後に追加します。

```js
const [typeMatch, setTypeMatch] = useState('any')
```

`any` を「いずれか」、`all` を「すべて」に対応させます。`FilterControls` へ、既存の props に加えて渡します。

```jsx
typeMatch={typeMatch}
onTypeMatchChange={setTypeMatch}
```

`FilterControls.jsx` の関数の引数部分を、次の形にします。

```jsx
export default function FilterControls({
  query, onQueryChange,
  selectedTypes, onTypeToggle,
  typeMatch, onTypeMatchChange,
  sortOrder, onSortChange,
}) {
```

`fieldset` の直後、並び順の `label` より前に追加します。

```jsx
<label className="filter-field" htmlFor="type-match">
  タイプの一致方法
  <select id="type-match" value={typeMatch} onChange={(event) => onTypeMatchChange(event.target.value)}>
    <option value="any">いずれかに一致</option>
    <option value="all">すべてに一致</option>
  </select>
</label>
```

`App.jsx` の `filter` の中にある `matchesType` の計算を、次の2つの変数へ置き換えます。`matchesName` と `return matchesName && matchesType` はそのまま残します。

```js
const matchesSelectedTypes = typeMatch === 'all'
  ? selectedTypes.every((type) => pokemon.types.some((entry) => entry.type.name === type))
  : selectedTypes.some((type) => pokemon.types.some((entry) => entry.type.name === type))
const matchesType = selectedTypes.length === 0 || matchesSelectedTypes
```

三項演算子で `every` と `some` を使い分けています。絞り込み結果はこれまでどおり計算で求め、別の state には入れません。

`resetConditions` も、次の形にします。一致方法も初期値へ戻します。

```js
function resetConditions() {
  setQuery('')
  setSelectedTypes([])
  setTypeMatch('any')
  setSortOrder('asc')
}
```

現在の条件を表示する `p` 全体を、次に置き換えます。

```jsx
<p className="current-conditions">
  名前: {query.trim() || '指定なし'} ／ タイプ: {selectedTypes.length === 0 ? 'すべて' : selectedTypes.map((type) => typeNames[type]).join(' / ')} ／ 一致: {typeMatch === 'all' ? 'すべて' : 'いずれか'} ／ 並び順: {sortOrder === 'asc' ? '小さい順' : '大きい順'}
</p>
```

**確認：** 「ほのお・ひこう」で一致方法を変えると、3匹と1匹を切り替えられます。モーダルを閉じても、選んだタイプと一致方法が条件の表示に残ります。リセットすると、チェックがすべて外れ、一致方法は「いずれか」、一覧は10匹に戻ります。

## ステップ6 未選択の場合を調べる

未選択を扱う条件には、どのような役割があるでしょうか。完成した `matchesType` の行だけを、一時的に次へ変えます。

```js
const matchesType = matchesSelectedTypes
```

**予想して確かめる：** 名前を空にし、タイプのチェックをすべて外します。一致方法を切り替えて、結果を比較します。

| 一致方法 | 未選択時の実験結果 |
| --- | --- |
| いずれかに一致（some） | 0匹 |
| すべてに一致（every） | 10匹 |

空の配列では、`some` は条件を満たす要素がないため `false`、`every` は条件に反する要素がないため `true` になります。「未選択なら、どちらの一致方法でもタイプを絞らない」という画面のルールは、別に指定する必要があります。

確認後は、必ず次へ戻します。

```js
const matchesType = selectedTypes.length === 0 || matchesSelectedTypes
```

**確認：** チェックをすべて外すと、どちらの一致方法でも10匹になります。名前検索は引き続き使えます。

## ステップ7 ほかの操作と組み合わせる

一連の操作を順番に試します。途中で何匹になるかを先に予想してから操作してください。

| 操作 | 確認する結果 |
| --- | --- |
| 条件をリセットする | 10匹が番号の小さい順に並ぶ |
| ほのお・みず、いずれか一致にする | 番号4〜9の6匹になる |
| 名前に `CHAR` を入力する | 大文字でも番号4・5・6の3匹になる |
| 番号が大きい順にする | 番号6・5・4の順になる |
| すべて一致へ変える | 0匹の案内が出る |
| みずを外し、ほのおだけにする | 番号6・5・4に戻る |
| チェックボックスにフォーカスしたまま Escape で閉じる | 条件が維持され、開いたボタンへフォーカスが戻る |
| 番号6の詳細を開いて一覧へ戻る | 条件と順序が維持され、番号6のボタンへフォーカスが戻る |
| 開き直して条件をリセットする | 名前が空になり、タイプ未選択・いずれか一致・小さい順に戻る |

条件は即時反映するため、Escape は取り消し操作にはなりません。適用とキャンセルは第16章で追加します。

`Tab` でチェックボックスへ移動し、`Space` でも選択・解除します。幅320ピクセルでも、モーダルの内容をスクロールして全タイプとボタンを操作でき、横にはみ出さないことを確認してください。

最後に、自分のコードをビルドします。

```sh
npm run build
```

完成例を確認する場合は、リポジトリ直下で実行します。

```sh
npm run dev:example -- examples/14-multi-type-filter
```

## 小さな練習

`typeMatch` の初期値と、`resetConditions` の中の値を両方 `'all'` に変えてください。再読み込み直後とリセット直後で一致方法がどう変わるか予想し、タイプ未選択なら10匹のままであることも確認します。確認後は、どちらも `'any'` へ戻してください。

「ポケモンが複数タイプを持つこと」と「検索条件で複数タイプを選ぶこと」の違いを、内側と外側の `some` の役割を使って説明してみてください。

完成コードは [App.jsx](../../examples/14-multi-type-filter/src/App.jsx)、[FilterControls.jsx](../../examples/14-multi-type-filter/src/components/FilterControls.jsx)、[styles.css](../../examples/14-multi-type-filter/src/styles.css) にあります。

[前へ：第13章 仕上げ](../basic/13-finish.md) / [次へ：第15章 ページ分割](15-pagination.md)
