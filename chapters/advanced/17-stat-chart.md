# 第17章 ステータスのグラフ化

詳細画面の6種類のステータスを、数値と棒グラフで表示します。同じデータから、文字による表示とグラフを組み立てます。

## この章の目標

- ステータスの数値を、棒グラフの表示幅へ換算する
- データから計算した値を、見た目の指定に使う
- 表示幅の基準と、数値との関係を説明する
- 各ステータスを同じコンポーネントで表示する




第16章の完成状態から始めます。完成例は [examples/17-stat-chart/](../../examples/17-stat-chart/) です。編集する場所はリポジトリ直下の `src/` です。API の対象は番号1〜10のままです。

## ステップ1 数値から幅を計算する部品を作る

6種類のステータスは種族ごとの基本値です。レベルに応じたゲーム内の能力値ではありません。表示幅の基準を200とし、`value / STAT_SCALE * 100` で百分率を計算します。200は表示の基準で、種族値の最大値ではありません。`Math.min` と `Math.max` は表示幅を0〜100%に収めます。数値自体はそのまま残します。

`src/components/StatBar.jsx` を作成し、次の内容を記述します。

```jsx
export const STAT_SCALE = 200

export default function StatBar({ label, value }) {
  const width = Math.min(100, Math.max(0, value / STAT_SCALE * 100))

  return (
    <div className="stat-row">
      <dt>{label}</dt>
      <dd>
        <span>{value}</span>
        <span className="stat-track" aria-hidden="true">
          <span className="stat-fill" style={{ width: width + '%' }} />
        </span>
      </dd>
    </div>
  )
}
```

**確認：** 部品を作る段階では詳細の表示はまだ変わりません。値50なら25%、100なら50%になることを計算してみます。

## ステップ2 同じデータを数値と棒に使う

`style` には文字列ではなく JavaScript のオブジェクトを渡します。外側の波括弧は JSX の式、内側はオブジェクトです。グラフの棒は数値を補う装飾なので `aria-hidden` を付け、読み上げでは既存のラベルと数値を使います。

`src/components/PokemonDetail.jsx` の次の部分を変更します。変更前：

```jsx
import statNames from '../data/statNames.ja.json'
```

変更後：

```jsx
import statNames from '../data/statNames.ja.json'
import StatBar, { STAT_SCALE } from './StatBar.jsx'
```

`src/components/PokemonDetail.jsx` の次の部分を変更します。変更前：

```jsx
        <h3>ステータス</h3>
```

変更後：

```jsx
        <h3>ステータス</h3>
        <p>表示幅の基準: {STAT_SCALE}（種族ごとの基本値）</p>
```

`src/components/PokemonDetail.jsx` の次の部分を変更します。変更前：

```jsx
            <div key={entry.stat.name}>
              <dt>{statNames[entry.stat.name]}</dt>
              <dd>{entry.base_stat}</dd>
            </div>
```

変更後：

```jsx
            <StatBar key={entry.stat.name} label={statNames[entry.stat.name]} value={entry.base_stat} />
```

**確認：** 詳細を開くと6種類の名前と数値があり、各行の棒の長さが数値に応じて変わります。

## ステップ3 棒と数値の配置を整える

CSS の幅100%を基準に、内側の span の幅を変えます。`minmax(0, 1fr)` は狭い画面で値の列が必要以上に広がらないようにする指定です。

`src/styles.css` の末尾に追加します。

```css
.pokemon-stats .stat-row {
  display: grid;
  grid-template-columns: 7em minmax(0, 1fr);
  gap: 12px;
}

.stat-row dd {
  min-width: 0;
  margin: 0;
}

.stat-track {
  display: block;
  height: 12px;
  overflow: hidden;
  border-radius: 6px;
  background-color: var(--color-border);
}

.stat-fill {
  display: block;
  height: 100%;
  background-color: var(--color-accent);
}
```

**確認：** 別のポケモンを開くと、同じ部品を使ったまま数値と棒が変わります。幅320pxでも数値と棒が収まります。

**予想して確かめる：** `STAT_SCALE` を100に変え、棒の長さと基準の表示が同時に変わることを確認します。数値は変わりません。確認後は200へ戻してください。

## ステップ4 表示の基準を超える値を試す

幅は0〜100%に制限しても、表示する数値は変えません。グラフが表せる範囲と、実際のデータの値を区別します。データそのものを上書きせず、渡す props を一時的に変更して観察します。

**確認：** 次の実験を行い、棒が枠を超えずに数値250を表示できることを確認します。

**予想して確かめる：** PokemonDetail.jsx の StatBar に渡す `value={entry.base_stat}` を、一時的に `value={250}` へ変えます。6本とも幅100%で数値250になることを予想して確かめ、確認後は `value={entry.base_stat}` へ戻してください。

## 小さな練習

ラベルの列幅を7emから6emへ一時的に変えて、同じ数値でも利用できる棒の長さが変わることを確認します。確認後は7emに戻してください。値の割合と、画面上の実際の長さの関係を説明します。

## 完成状態の確認

次の操作を試し、変更した値から表示までの流れを説明してください。各ステップの一時的な変更は元に戻してから次章へ進みます。

- 詳細に6種類の数値と棒があり、表示幅の基準200が明示される。

- 数値が変わると同じ部品の棒の長さが変わり、狭い画面でも収まる。

- 条件・ページ・詳細からのフォーカス復帰が維持される。

自分のコードをビルドする場合は、リポジトリ直下で実行します。

```sh
npm run build
```

完成例を起動する場合は、次を実行します。

```sh
npm run dev:example -- examples/17-stat-chart
```

完成コードは [src/](../../examples/17-stat-chart/src/) にあります。前章の完成例と比べ、追加したファイルと変更した箇所を確認できます。

## 参考資料

- [React：style](https://ja.react.dev/reference/react-dom/components/common#applying-css-styles)

- [MDN：Math.min](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Math/min)

[前へ：第16章](16-apply-cancel-filters.md) / [次へ：第18章](18-favorites.md)
