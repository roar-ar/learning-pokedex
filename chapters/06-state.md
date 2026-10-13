# 第06章 クリックと state

カードにボタンを付け、選んだポケモンの番号を画面に表示します。操作によって変わる値を React の state で管理します。

## この章の目標

- `useState` で選択を保持する
- クリック時の処理を親子で受け渡す
- state の更新が表示へ反映されることを確かめる

第05章の完成状態から始めます。完成例は [examples/06-state/](../examples/06-state/) です。

## ステップ1 選択した番号を state にする

React は、state が更新されるとコンポーネントを再び実行して表示を更新します。普通の変数に代入するだけでは、表示の更新を React に伝えられません。[React：state はコンポーネントのメモリ](https://ja.react.dev/learn/state-a-components-memory)

`App.jsx` の先頭に追加します。

```js
import { useState } from 'react'
```

`App` の関数の先頭に追加します。

```js
const [selectedId, setSelectedId] = useState(null)
```

`useState` は、現在の値と更新用の関数を配列で返します。`selectedId` が値、`setSelectedId` が更新用の関数です。配列から2つを取り出す記法も分割代入です。`null` は、まだ何も選んでいない状態を表します。

ページの `h1` の後ろに追加します。

```jsx
<p className="result-summary" role="status">
  選択した番号: {selectedId === null ? '未選択' : selectedId}
</p>
```

`===` は値を比較する記号です。`条件 ? A : B` は、条件が成り立つ場合に A、それ以外で B を使う「三項演算子」です。

**確認：** `選択した番号: 未選択` と表示されます。`role="status"` は、表示の変化を画面読み上げへ知らせるための指定です。

## ステップ2 クリックを親へ知らせる

`PokemonCard` の引数を変更します。

```jsx
export default function PokemonCard({ pokemon, onSelect }) {
```

カードの `ul` の後ろに追加します。

```jsx
<button className="pokemon-select" type="button" onClick={() => onSelect(pokemon.id)}>
  このポケモンを選ぶ
</button>
```

`onClick` には、クリックされたときに実行する関数を渡します。`() => onSelect(pokemon.id)` は、クリック時にそのポケモンの番号を引数として渡す関数です。[React：イベントへの応答](https://ja.react.dev/learn/responding-to-events)

親の `App.jsx` で、`map` のカードに props を追加します。

```jsx
<PokemonCard key={pokemon.id} pokemon={pokemon} onSelect={setSelectedId} />
```

**確認：** ヒトカゲのボタンを押すと、選択した番号が `4` になります。別のボタンを押すと、番号が切り替わります。

`onClick={onSelect(pokemon.id)}` と書くと、表示を作る途中で処理を実行してしまいます。クリック時に実行する関数を渡しているか確認してください。

## ステップ3 選んだボタンを分かるようにする

`App.jsx` のカードへ、選択中かどうかを渡します。

```jsx
<PokemonCard
  key={pokemon.id}
  pokemon={pokemon}
  onSelect={setSelectedId}
  isSelected={pokemon.id === selectedId}
/>
```

子の引数にも `isSelected` を追加します。

```jsx
export default function PokemonCard({ pokemon, onSelect, isSelected }) {
```

子のボタンに `aria-pressed={isSelected}` を追加します。これは、ボタンの選択状態を伝える属性です。

`styles.css` の末尾に追加します。

```css
button {
  padding: 10px 14px;
  border: 1px solid var(--color-accent);
  border-radius: 8px;
  color: #ffffff;
  background-color: var(--color-accent);
  cursor: pointer;
}

button:hover {
  background-color: #244b8c;
}

.pokemon-select {
  width: 100%;
  margin-top: 20px;
}

button[aria-pressed="true"] {
  outline: 3px solid var(--color-accent);
  outline-offset: 3px;
  background-color: #1b3c6f;
}

.result-summary {
  margin: 20px 0;
}
```

**確認：** 選んだボタンに枠が付きます。別のポケモンを選ぶと、枠も移動します。state は親に1つあり、各カードはその値を比較して表示しています。

## ステップ4 キーボードでも操作する

`Tab` キーでボタンへ移動し、`Enter` または `Space` キーで選択します。

**確認：** マウスと同じように番号とボタンの状態が変わります。フォーカスの枠も見えることを確認してください。ページを再読み込みすると state は初期値へ戻り、未選択になります。

## 小さな練習

番号が変わるまでの流れを、`ボタン → onSelect → setSelectedId → 再表示` の順にコードで追ってください。

完成コードは [App.jsx](../examples/06-state/src/App.jsx) と [PokemonCard.jsx](../examples/06-state/src/components/PokemonCard.jsx) にあります。

[前へ：第05章 一覧の作成](05-list.md) / [次へ：第07章 詳細画面](07-detail.md)
