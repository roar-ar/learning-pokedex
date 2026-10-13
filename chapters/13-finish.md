# 第13章 仕上げ

図鑑の基本機能ができました。この章では、条件の表示、リセット、キーボード操作、狭い画面での見た目を整え、ビルドしたアプリを確認します。

## この章の目標

- 現在の条件を分かるように表示する
- 条件を初期値へ戻せるようにする
- 詳細から一覧へ戻ったときのフォーカスを整える
- 画面幅と通信状態を変えて確認し、ビルドする

第12章の完成状態から始めます。完成例は [examples/13-finish/](../examples/13-finish/) です。

## ステップ1 現在の条件を表示する

モーダルを閉じていても、どの条件で表示しているか分かるようにします。`App.jsx` に対応表を import します。

```js
import typeNames from './data/typeNames.ja.json'
```

閉じる `dialog` タグの後、件数表示の前に追加します。

```jsx
<p className="current-conditions">
  名前: {query.trim() || '指定なし'} ／ タイプ: {selectedType ? typeNames[selectedType] : 'すべて'} ／ 並び順: {sortOrder === 'asc' ? '小さい順' : '大きい順'}
</p>
```

空文字などの場合に `||` の右側を使うことで、未指定の条件にも表示名を付けています。

**確認：** モーダルで `char` と入力して閉じると、条件の表示にもその文字が出ます。タイプと並び順も変更して確かめてください。

## ステップ2 条件をリセットする

`App` の関数内に、条件を初期値へ戻す関数を追加します。

```js
function resetConditions() {
  setQuery('')
  setSelectedType('')
  setSortOrder('asc')
}
```

モーダルの閉じるボタンを、次のボタン群に置き換えます。

```jsx
<div className="dialog-actions">
  <button type="button" onClick={resetConditions}>条件をリセット</button>
  <button type="button" onClick={() => dialogRef.current.close()}>条件を閉じる</button>
</div>
```

**確認：** リセットすると入力が空になり、タイプは「すべて」、並び順は「小さい順」になります。全件の件数に戻ることも確認します。

## ステップ3 一覧へ戻るときにフォーカスを戻す

詳細へ移動すると、一覧のボタンは画面から取り除かれます。戻ったときには、直前に開いたカードのボタンへフォーカスを戻します。

ほかの Hooks と並べて追加します。

```js
const [lastSelectedId, setLastSelectedId] = useState(null)
const returnButtonRef = useRef(null)
```

`lastSelectedId` は、一覧へ戻っても覚えておく直前の番号です。`returnButtonRef` は、戻った後のボタンを参照するために使います。

`App` の関数内に追加します。

```js
function handleSelect(id) {
  setLastSelectedId(id)
  setSelectedId(id)
}
```

一覧の `PokemonCard` の props を変更します。

```jsx
<PokemonCard
  key={pokemon.id}
  pokemon={pokemon}
  onSelect={handleSelect}
  buttonRef={pokemon.id === lastSelectedId ? returnButtonRef : null}
/>
```

子の `PokemonCard` は、引数に `buttonRef` を追加し、ボタンに `ref={buttonRef}` を追加します。

```jsx
export default function PokemonCard({ pokemon, onSelect, buttonRef }) {
```

親の `App` に、取得の Effect と別の Effect を追加します。ほかの Hooks と同様、条件分岐より前に置きます。

```js
useEffect(() => {
  if (selectedId === null && lastSelectedId !== null) {
    returnButtonRef.current?.focus()
  }
}, [selectedId, lastSelectedId])
```

表示が反映された後、一覧へ戻った状態ならボタンをフォーカスします。`?.` は、参照先がある場合だけ `focus()` を呼ぶ書き方です。[React：ref で DOM を操作する](https://ja.react.dev/learn/manipulating-the-dom-with-refs)

**確認：** キーボードでリザードンの詳細を開いて戻ると、そのカードの「詳細を見る」へフォーカスが戻ります。そのまま `Tab` で次のカードへ進めます。

## ステップ4 狭い画面で整える

まず、共通 CSS の `body` にある `min-width: 320px` を削除します。縦スクロールバーが出る画面では、内容に使える幅がブラウザ全体の幅より狭くなるため、固定の最小幅が横スクロールの原因になります。`body` は次の形になります。

```css
body {
  min-height: 100vh;
  margin: 0;
}
```

`styles.css` の末尾に追加します。

```css
.dialog-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.current-conditions {
  overflow-wrap: anywhere;
  color: #52637a;
}

@media (max-width: 600px) {
  #root {
    padding: 20px 16px;
  }

  .pokemon-card,
  .pokemon-detail,
  .filters-dialog {
    padding: 16px;
  }

  .pokemon-image {
    width: 160px;
    height: 160px;
  }
}
```

`@media` は条件に合う場合だけスタイルを使う指定です。ここでは幅600ピクセル以下で画像と余白を小さくします。`overflow-wrap` は長い検索文字が表示の幅を超えないよう折り返します。[MDN：メディアクエリーの使用](https://developer.mozilla.org/ja/docs/Web/CSS/CSS_media_queries/Using_media_queries)

**確認：** 開発者ツールの端末表示機能などで幅320ピクセルを試します。カード、詳細、モーダルが横にはみ出さず、スクロールしてすべての情報やボタンを見られるか確認してください。

## ステップ5 一連の操作を確認する

次の順で操作し、問題があればコンソールと該当するコードを見ます。

| 操作 | 確認する結果 |
| --- | --- |
| 条件をリセットする | 全件が番号の小さい順になる |
| `CHAR` を検索する | 英字の大文字・小文字にかかわらず3匹が出る |
| タイプを「ひこう」にする | リザードンだけになる |
| 存在しない名前を入力する | 0件の案内が出る |
| 条件をリセットして大きい順にする | 番号10が先頭になる |
| 詳細を開く | 基本情報、特性、6種類のステータスがある |
| 一覧へ戻る | 条件と順序が維持され、ボタンへフォーカスが戻る |
| モーダルで `Escape` を押す | 閉じて開いたボタンへフォーカスが戻る |

**確認：** マウスとキーボードの両方で操作します。通信の失敗と再試行も、第12章の手順で確認してください。

## ステップ6 ビルドしたアプリを確認する

開発サーバーを停止し、リポジトリ直下で実行します。

```sh
npm run build
npm run preview
```

`build` は公開用のファイルを `dist/` に作ります。`preview` は、そのファイルを確認するためのローカルサーバーです。ターミナルに表示された URL を開きます。`dist/index.html` を直接開くのではなく、サーバー経由で確認してください。[Vite：ビルド結果の確認](https://vite.dev/guide/static-deploy.html#testing-the-app-locally)

**確認：** ビルドが成功し、手順どおりに編集した自分の図鑑が表示されます。検索、詳細、モーダルをもう一度確認してください。`preview` は動作確認用のサーバーです。

完成例をビルドする場合は、リポジトリ直下で次を実行します。

```sh
npm run build:example -- examples/13-finish
npm run preview -- examples/13-finish
```

## 学習の振り返り

コードを見ながら、次のことを説明してみてください。

- `App` が持つ state と、その値を使うコンポーネント
- Hooks を呼ぶ場所と、state の更新を依頼した後に表示が変わる流れ
- 入力から検索結果が変わるまでの流れ
- `map`・`filter`・`sort` の役割の違い
- API 取得を Effect で行い、結果を state に入れる理由
- state と ref の用途の違い、Effect のクリーンアップの役割
- `nameja` がないときに何が起き、どう修正したか
- CSS の変更とデータの変更が、画面のどの部分に反映されるか

完成コードは [App.jsx](../examples/13-finish/src/App.jsx)、[各コンポーネント](../examples/13-finish/src/components/)、[取得処理](../examples/13-finish/src/api/pokemon.js)、[styles.css](../examples/13-finish/src/styles.css) にあります。

[前へ：第12章 PokéAPI](12-pokeapi.md) / [README に戻る](../README.md)
