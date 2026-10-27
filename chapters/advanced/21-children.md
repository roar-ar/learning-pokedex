# 第21章 children による部品の組み合わせ

共通の枠やダイアログを、内側の内容を受け取るコンポーネントにします。同じ部品へ異なる内容を渡し、画面を組み立てます。

## この章の目標

- コンポーネントのタグで囲んだ内容を、children として受け取る
- 共通の見た目や操作を持つコンポーネントを作る
- props で渡す値や操作と、children で渡す内容を使い分ける
- 同じ枠に異なる内容を組み合わせる




第20章の完成状態から始めます。完成例は [examples/21-children/](../../examples/21-children/) です。編集する場所はリポジトリ直下の `src/` です。API の対象は番号1〜10のままです。

## ステップ1 内容を受け取る共通の枠を作る

コンポーネントの開始タグと終了タグの間へ渡した JSX は、`children` という props に入ります。見出しは title、内側の内容は children として分けると、内容の種類を固定しない枠を作れます。children も props の1つです。

`src/components/InfoPanel.jsx` を作成し、次の内容を記述します。

```jsx
export default function InfoPanel({ title, children }) {
  return (
    <section className="info-panel">
      <h3>{title}</h3>
      {children}
    </section>
  )
}
```

**確認：** InfoPanel はまだ使っていないため表示は変わりません。同じ枠にリストもグラフも入れられることをコードから予想します。

## ステップ2 特性とステータスへ異なる内容を渡す

同じ InfoPanel に、特性の ul とステータスの dl をそれぞれ渡します。枠の中へ何を表示するかは呼び出す側が決めます。複数の子要素も、タグで囲んだ順番に表示されます。

`src/components/PokemonDetail.jsx` の次の部分を変更します。変更前：

```jsx
import StatBar, { STAT_SCALE } from './StatBar.jsx'
```

変更後：

```jsx
import StatBar, { STAT_SCALE } from './StatBar.jsx'
import InfoPanel from './InfoPanel.jsx'
```

`src/components/PokemonDetail.jsx` の次の部分を変更します。変更前：

```jsx
        <h3>特性</h3>
```

変更後：

```jsx
        <InfoPanel title="特性">
```

`src/components/PokemonDetail.jsx` の次の部分を変更します。変更前：

```jsx
        </ul>
        <h3>ステータス</h3>
```

変更後：

```jsx
        </ul>
        </InfoPanel>
        <InfoPanel title="ステータス">
```

`src/components/PokemonDetail.jsx` の次の部分を変更します。変更前：

```jsx
        </dl>
      </article>
```

変更後：

```jsx
        </dl>
        </InfoPanel>
      </article>
```

`src/styles.css` の末尾に追加します。

```css
.info-panel {
  margin-top: 24px;
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
}
```

**確認：** 詳細画面に特性とステータスが表示され、グラフと数値も維持されています。共通の枠の余白が両方へ反映されます。

**予想して確かめる：** 特性の InfoPanel の中へ一時的に `<p>特性の説明を追加できます。</p>` を入れます。InfoPanel 自体を変更せず説明が追加されることを確認し、練習の p は削除してください。

## ステップ3 ダイアログの枠も部品にする

枠と見出しは Modal に、入力欄と操作ボタンは children にします。`useId` は、部品ごとの見出しを関連付けるためのIDを作ります。dialogRef は呼び出し側が showModal と close を使うための参照として渡します。ref の受け渡しと、状態を props で渡すことの役割を区別します。

`src/components/Modal.jsx` を作成し、次の内容を記述します。

```jsx
import { useId } from 'react'

export default function Modal({ dialogRef, title, onCancel, children }) {
  const titleId = useId()

  return (
    <dialog className="filters-dialog" ref={dialogRef} aria-labelledby={titleId} onCancel={onCancel}>
      <h2 id={titleId}>{title}</h2>
      {children}
    </dialog>
  )
}
```

**確認：** 新しい部品を保存します。dialog のモーダル表示やキーボード操作は標準要素を使い続ける設計です。

## ステップ4 条件の入力と操作を children に渡す

入力欄・説明・ボタンのまとまりを Modal の内側へ置きます。状態と操作は App が保持し、Modal はその具体的な条件を知る必要がありません。children にしたからといって state の置き場所が変わるわけではありません。

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
import ThemeToggle from './components/ThemeToggle.jsx'
```

変更後：

```jsx
import ThemeToggle from './components/ThemeToggle.jsx'
import Modal from './components/Modal.jsx'
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
      <dialog className="filters-dialog" ref={dialogRef} aria-labelledby="filters-title" onCancel={() => setDraft(copyConditions(conditions))}>
        <h2 id="filters-title">検索・並び替えの条件</h2>
```

変更後：

```jsx
      <Modal dialogRef={dialogRef} title="検索・並び替えの条件" onCancel={() => setDraft(copyConditions(conditions))}>
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
      </dialog>
```

変更後：

```jsx
      </Modal>
```

**確認：** 検索条件のモーダルが開き、適用・キャンセル・Escape・フォーカス復帰が前章と同じように動きます。

**予想して確かめる：** Modal の title だけを一時的に「図鑑の表示設定」へ変えます。見出しだけが変わり、入力や操作はそのままであることを確かめ、元へ戻してください。

## 小さな練習

InfoPanel の `{children}` を一時的に外すと、どこまで表示されるでしょうか。特性とステータスの見出しだけが残ることを確かめ、元に戻してください。title と children の役割を説明します。

## 完成状態の確認

次の操作を試し、変更した値から表示までの流れを説明してください。各ステップの一時的な変更は元に戻してから次章へ進みます。

- 同じ InfoPanel の枠に特性のリストとステータスのグラフが表示される。

- Modal の内側の入力と適用・キャンセルが動作する。

- モーダルのキーボード操作とフォーカス復帰が維持される。

自分のコードをビルドする場合は、リポジトリ直下で実行します。

```sh
npm run build
```

完成例を起動する場合は、次を実行します。

```sh
npm run dev:example -- examples/21-children
```

完成コードは [src/](../../examples/21-children/src/) にあります。前章の完成例と比べ、追加したファイルと変更した箇所を確認できます。

## 参考資料

- [React：JSX を children として渡す](https://ja.react.dev/learn/passing-props-to-a-component#passing-jsx-as-children)

- [React：useId](https://ja.react.dev/reference/react/useId)

[前へ：第20章](20-custom-hooks.md) / [次へ：第22章](22-reducer.md)
