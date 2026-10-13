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

`useState(null)` の `null` は、コンポーネントを表示し始めるときの初期値です。再レンダーでは、React が覚えている現在の値を受け取ります。

`useState` は、React の機能を利用するための **Hook（フック）** の1つです。この教材の Hooks は、コンポーネントの関数内で、条件分岐や `return` より前に呼びます。`if`・ループ・クリック時の関数の中へ置かず、毎回同じ順序で呼ぶことがルールです。[React：フックのルール](https://ja.react.dev/reference/rules/rules-of-hooks)

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
  {pokemon.nameja}を選ぶ
</button>
```

`onClick` には、クリックされたときに実行する関数を渡します。`() => onSelect(pokemon.id)` は、クリック時にそのポケモンの番号を引数として渡す関数です。[React：イベントへの応答](https://ja.react.dev/learn/responding-to-events)

親の `App.jsx` で、`map` のカードに props を追加します。

```jsx
<PokemonCard key={pokemon.id} pokemon={pokemon} onSelect={setSelectedId} />
```

**確認：** ヒトカゲのボタンを押すと、選択した番号が `4` になります。別のボタンを押すと、番号が切り替わります。

`onClick={onSelect(pokemon.id)}` と書くと、表示を作る途中で処理を実行してしまいます。クリック時に実行する関数を渡しているか確認してください。

ボタンの文字には名前も含めています。ボタンだけを見たり読み上げたりしても、どのポケモンを選ぶのか分かります。

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

## ステップ4 state が更新されるタイミングを調べる

React がコンポーネントの関数を呼び、表示内容を計算することを **レンダー** と呼びます。更新関数は、次のレンダーに使う値を React に伝えます。実行中の関数が持つ state の値は、そのレンダー時点のものです。[React：state はスナップショットである](https://ja.react.dev/learn/state-as-a-snapshot)

`App.jsx` の関数内で、state の宣言の後に一時的な関数を追加します。

```js
function handleSelect(id) {
  console.log('選ぶ番号:', id)
  console.log('更新前:', selectedId)
  setSelectedId(id)
  console.log('更新を依頼した直後:', selectedId)
}
```

親から渡す `onSelect={setSelectedId}` を `onSelect={handleSelect}` に変更し、ページを再読み込みします。

**確認：** 初めてヒトカゲを選ぶと、選ぶ番号は `4`、後の2つのログはどちらも `null` です。一方、画面には更新後の番号 `4` が出ます。次にリザードンを選ぶと、選ぶ番号は `6`、後の2つのログはどちらも前回の `4` になります。

`console.log` はコンソールへ値を出して調べるための関数です。確認後は、一時的な `handleSelect` を削除し、`onSelect={setSelectedId}` に戻してください。

## ステップ5 キーボードでも操作する

`Tab` キーでボタンへ移動し、`Enter` または `Space` キーで選択します。

**確認：** マウスと同じように番号とボタンの状態が変わります。フォーカスの枠も見えることを確認してください。ページを再読み込みすると state は初期値へ戻り、未選択になります。

## 小さな練習

番号が変わるまでの流れを、`ボタン → onSelect → setSelectedId → 再表示` の順にコードで追ってください。

完成コードは [App.jsx](../examples/06-state/src/App.jsx) と [PokemonCard.jsx](../examples/06-state/src/components/PokemonCard.jsx) にあります。

[前へ：第05章 一覧の作成](05-list.md) / [次へ：第07章 詳細画面](07-detail.md)
