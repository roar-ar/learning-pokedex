# 第19章 テーマ切り替え

明るい配色と暗い配色を切り替えられるようにします。選んだテーマを保存し、次に開いたときも同じ配色で表示します。

## この章の目標

- 選んだテーマを state に保持する
- CSS 変数で、背景・文字・枠線などの色をまとめる
- テーマに応じて、画面全体の配色を切り替える
- localStorage へ設定を保存し、初期表示に反映する




第18章の完成状態から始めます。完成例は [examples/19-theme/](../../examples/19-theme/) です。編集する場所はリポジトリ直下の `src/` です。API の対象は番号1〜10のままです。

## ステップ1 テーマの値を復元する

テーマは light と dark の2つに限定します。お気に入りと同じ保存関数を使い、別のキーで管理します。色そのものではなく、選択したテーマ名を state に保持します。

`src/utils/preferences.js` の末尾に追加します。

```js
export function isTheme(value) {
  return value === 'light' || value === 'dark'
}
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
import { isFavoriteIds } from './utils/preferences.js'
```

変更後：

```jsx
import { isFavoriteIds, isTheme } from './utils/preferences.js'
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
  const [page, setPage] = useState(1)
```

変更後：

```jsx
  const [page, setPage] = useState(1)
  const [theme, setTheme] = useState(() => readStoredValue('pokedex:theme', 'light', isTheme))

  useEffect(() => {
    writeStoredValue('pokedex:theme', theme)
    document.documentElement.dataset.theme = theme
  }, [theme])
```

**確認：** 保存値がなければ light です。この段階では色の切り替えはまだ接続していません。

## ステップ2 選択したテーマを HTML へ反映する

`document.documentElement` は html 要素です。`dataset.theme` に代入すると `data-theme="dark"` のような属性になります。React の state とブラウザの要素を同期するために Effect を使います。ボタンの操作は親へ渡し、詳細でも使えるよう各表示分岐に置きます。

`src/components/ThemeToggle.jsx` を作成し、次の内容を記述します。

```jsx
export default function ThemeToggle({ theme, onThemeChange }) {
  return (
    <button type="button" className="theme-toggle" onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}>
      {theme === 'dark' ? 'ライト' : 'ダーク'}テーマに切り替える
    </button>
  )
}
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
import FilterControls from './components/FilterControls.jsx'
```

変更後：

```jsx
import FilterControls from './components/FilterControls.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
```

`src/App.jsx` の次の部分を変更します。同じ記述がある箇所は、すべて変更します。変更前：

```jsx
<h1>ポケモン図鑑</h1>
```

変更後：

```jsx
<h1>ポケモン図鑑</h1>
<ThemeToggle theme={theme} onThemeChange={setTheme} />
```

**確認：** ボタンでライトとダークを切り替えると、開発者ツールの html 要素の data-theme が変わります。配色は次のステップで変わります。

## ステップ3 配色を CSS 変数へまとめる

背景・文字・枠線の意味ごとに CSS 変数を用意します。属性セレクターで変数の値だけを上書きすると、同じコンポーネントの配色をまとめて変更できます。`color-scheme` は入力部品などのブラウザ標準の配色にもテーマを伝えます。

`src/styles.css` の次の部分を変更します。変更前：

```css
  color: #243041;
  background-color: #f6f8fb;
```

変更後：

```css
  color: var(--color-text);
  background-color: var(--color-background);
  color-scheme: light;

  --color-text: #243041;
  --color-muted: #52637a;
  --color-background: #f6f8fb;
  --color-button-text: #ffffff;
  --color-hover: #244b8c;
  --color-pressed: #1b3c6f;
```

`src/styles.css` の次の部分を変更します。同じ記述がある箇所は、すべて変更します。変更前：

```css
color: #52637a;
```

変更後：

```css
color: var(--color-muted);
```

`src/styles.css` の次の部分を変更します。同じ記述がある箇所は、すべて変更します。変更前：

```css
color: #ffffff;
```

変更後：

```css
color: var(--color-button-text);
```

`src/styles.css` の次の部分を変更します。同じ記述がある箇所は、すべて変更します。変更前：

```css
background-color: #244b8c;
```

変更後：

```css
background-color: var(--color-hover);
```

`src/styles.css` の次の部分を変更します。同じ記述がある箇所は、すべて変更します。変更前：

```css
background-color: #1b3c6f;
```

変更後：

```css
background-color: var(--color-pressed);
```

`src/styles.css` の末尾に追加します。

```css
:root[data-theme="dark"] {
  color-scheme: dark;
  --color-text: #edf2fa;
  --color-muted: #b5c2d5;
  --color-background: #101824;
  --color-surface: #1c293c;
  --color-border: #526581;
  --color-accent: #91baff;
  --color-button-text: #101824;
  --color-hover: #b5d1ff;
  --color-pressed: #cce0ff;
}

.theme-toggle {
  margin-bottom: 12px;
}
```

**確認：** 一覧・詳細・モーダル・グラフの配色が一緒に変わります。ダークテーマで再読み込みしても選択が復元されます。

**予想して確かめる：** ダークテーマの --color-accent を一時的に別の色へ変え、ボタン・棒・フォーカス枠がどう変わるか確認します。確認後は元の値へ戻してください。

## ステップ4 保存値と表示を比較する

保存する値は画面全体の設定で、検索条件とは独立しています。条件をリセットしてもテーマを初期化しないことで、値ごとの役割を分けます。初回描画の後に Effect が反映される実装なので、保存値を読み込んだ直後に一瞬明るい背景が見える場合があります。

**確認：** 検索条件をリセットしてもテーマとお気に入りは維持されます。不正なテーマ値を保存して再読み込みすると light へ戻ります。

## 小さな練習

一時的にテーマの Effect から dataset の代入を外してください。保存値とボタンの文字は変わるのに色が変わらない理由を説明します。確認後は代入を戻し、再読み込みしてください。

## 完成状態の確認

次の操作を試し、変更した値から表示までの流れを説明してください。各ステップの一時的な変更は元に戻してから次章へ進みます。

- 一覧・詳細・モーダルの配色とボタンの文字がテーマに対応する。

- 再読み込み後もテーマが復元され、不正値は light に戻る。

- 検索条件のリセットでテーマやお気に入りが失われない。

自分のコードをビルドする場合は、リポジトリ直下で実行します。

```sh
npm run build
```

完成例を起動する場合は、次を実行します。

```sh
npm run dev:example -- examples/19-theme
```

完成コードは [src/](../../examples/19-theme/src/) にあります。前章の完成例と比べ、追加したファイルと変更した箇所を確認できます。

## 参考資料

- [MDN：CSS カスタムプロパティ](https://developer.mozilla.org/ja/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties)

- [MDN：HTMLElement.dataset](https://developer.mozilla.org/ja/docs/Web/API/HTMLElement/dataset)

[前へ：第18章](18-favorites.md) / [次へ：第20章](20-custom-hooks.md)
