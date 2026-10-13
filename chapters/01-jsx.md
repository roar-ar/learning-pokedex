# 第01章 JSX

この章では、ポケモン図鑑の見出しと、1匹の紹介画面を作ります。名前や数値は、まずコードに直接書きます。

## この章の目標

- JSX で見出し、文章、箇条書きを表示できる
- 複数の要素を1つの親要素にまとめられる
- 開くタグと閉じるタグの対応を確認できる

第00章を終えた `src/App.jsx` から始めます。完成例は [examples/01-jsx/](../examples/01-jsx/) にあります。

## ステップ1 図鑑の見出しを作る

React では、画面を構成する部品を「コンポーネント」と呼びます。いまある `App` もその1つです。`App` は、表示する内容を返す JavaScript の関数として書かれています。[React：初めてのコンポーネント](https://ja.react.dev/learn/your-first-component)

`src/App.jsx` を次のように変更します。

```jsx
export default function App() {
  return <h1>ポケモン図鑑</h1>
}
```

| 記述 | ここでの意味 |
| --- | --- |
| `function App()` | `App` という名前の関数を定義する |
| 関数を囲む `{ }` | 関数の処理を書く範囲 |
| `return` | 表示する内容を返す |
| `export default` | この `App` を別のファイルから読み込めるようにする |

`src/main.jsx` は、この `App` を読み込んでページに表示しています。

`<h1>ポケモン図鑑</h1>` のように、JavaScript の中で HTML に似た書き方をする記法が **JSX** です。HTML はページの構造を表し、JSX は React のコードでその構造を記述するために使います。[React：JSX でマークアップを記述する](https://ja.react.dev/learn/writing-markup-with-jsx)

**確認：** ブラウザに `ポケモン図鑑` と表示されます。

## ステップ2 名前と図鑑番号を追加する

HTML の要素には役割があります。`h1` はページ全体の見出し、`h2` はその中の見出し、`p` は文章を表します。[MDN：HTML のコンテンツの作成](https://developer.mozilla.org/ja/docs/Learn_web_development/Getting_started/Your_first_website/Creating_the_content)

複数の要素を返すときは、1つの親要素で囲みます。今回は、ページの主要な内容を表す `main` を使います。`src/App.jsx` 全体を次のようにします。

```jsx
export default function App() {
  return (
    <main>
      <h1>ポケモン図鑑</h1>
      <h2>フシギダネ</h2>
      <p>図鑑番号: 1</p>
    </main>
  )
}
```

`return (` と `)` の間に、複数行の JSX を書いています。開く丸括弧を `return` と同じ行に置いてください。

**確認：** ページの見出し、ポケモン名、図鑑番号の3つが表示されます。文字の大きさが異なるのは、ブラウザが見出しなどに初期のスタイルを持っているためです。

## ステップ3 1匹分の情報をまとめる

図鑑には、後の章で複数のポケモンを並べます。いまは1匹分の情報を `article` で囲みます。`article` は、それだけでも意味のあるまとまりに使う要素です。[MDN：article 要素](https://developer.mozilla.org/ja/docs/Web/HTML/Reference/Elements/article)

`main` の中を次のように変更します。`h1` は `article` の外側に置きます。

```jsx
<main>
  <h1>ポケモン図鑑</h1>
  <article>
    <h2>フシギダネ</h2>
    <p>図鑑番号: 1</p>
  </article>
</main>
```

これは `return (` の中を書き換えるための抜粋です。外側の `export default function App() { ... }` と、`return` の丸括弧は残してください。

**確認：** 見た目はほぼ変わりません。開発者ツールの要素画面で、`article` の中に `h2` と `p` があることを確認します。要素のまとまりは、見た目を変える前にも作れます。

## ステップ4 タイプ、高さ、重さを追加する

箇条書きには `ul` と `li` を使います。`ul` がリスト全体、`li` が1項目です。

`article` の中の `<p>図鑑番号: 1</p>` のすぐ後ろに、次を追加します。

```jsx
<ul>
  <li>タイプ: くさ</li>
  <li>高さ: 0.7 m</li>
  <li>重さ: 6.9 kg</li>
</ul>
```

**確認：** 図鑑番号の下に、タイプ、高さ、重さが箇条書きで表示されます。この段階では、タイプを1つ表示します。

ここまでの `src/App.jsx` は次の形です。

```jsx
export default function App() {
  return (
    <main>
      <h1>ポケモン図鑑</h1>
      <article>
        <h2>フシギダネ</h2>
        <p>図鑑番号: 1</p>
        <ul>
          <li>タイプ: くさ</li>
          <li>高さ: 0.7 m</li>
          <li>重さ: 6.9 kg</li>
        </ul>
      </article>
    </main>
  )
}
```

## ステップ5 JSX のタグを読み直す

表示できたら、コードと開発者ツールの要素を見比べます。

```text
main
├─ h1
└─ article
   ├─ h2
   ├─ p
   └─ ul
      ├─ li
      ├─ li
      └─ li
```

**確認：** `return` が返す一番外側の要素が `main` になっていること、各タグが正しい順序で閉じられていることを確かめます。

JSX ではタグを明示的に閉じます。内容を囲むものは `<p>文章</p>` のように書き、画像など内容を囲まない要素は `<img ... />` のように書きます。画像の実装は第03章で行います。[React：JSX のルール](https://ja.react.dev/learn/writing-markup-with-jsx#the-rules-of-jsx)

エラーになった場合は、次の点を見てください。

| 状態 | 確認すること |
| --- | --- |
| 見出しと文章を並べたらエラーになった | 1つの親要素にまとめているか |
| 閉じるタグのエラーが出た | タグ名と、閉じる順序が合っているか |
| 何も表示されない | `return (` の位置や、開発サーバーの URL を確認する |

## 小さな練習

タイプ、高さ、重さの順番を入れ替えてみてください。コードに書いた順番と画面の順番が対応することを確認します。終わったら、この章の完成コードの順番に戻します。

次の章では、ポケモン名や数値を JSON から読み込む形に変えます。

[前へ：第00章 起動と道具](00-getting-started.md) / [次へ：第02章 ローカル JSON の利用](02-local-json.md)
