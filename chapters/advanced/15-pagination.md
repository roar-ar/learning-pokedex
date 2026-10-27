# 第15章 ページ分割

一覧を1ページ分ずつ表示し、前後のページへ移動できるようにします。検索や絞り込みで件数が変わった場合のページ番号も扱います。

## この章の目標

- 表示するページ番号を state に保持する
- 絞り込み・並び替えの結果から、1ページ分のデータを取り出す
- 総ページ数に応じて、前後のページへの移動を制御する
- 検索条件が変わったときに、ページ番号を調整する




第14章の完成状態から始めます。完成例は [examples/15-pagination/](../../examples/15-pagination/) です。編集する場所はリポジトリ直下の `src/` です。API の対象は番号1〜10のままです。

## ステップ1 ページ番号と1ページの件数を決める

ページ分割は、取得する件数ではなく表示する範囲を変える処理です。まずページ番号だけを state に追加します。1ページの件数は変更しやすい定数にします。

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
export default function App() {
```

変更後：

```jsx
const PAGE_SIZE = 3

export default function App() {
  const [page, setPage] = useState(1)
```

**確認：** まだ一覧は10匹のままです。保存後にエラーがないことを確認します。

## ステップ2 並び替えた結果から1ページ分を取り出す

`Math.ceil` は小数点以下を切り上げます。10匹を3匹ずつ表示すると4ページです。ページ番号は1から、配列の位置は0から数えるため、開始位置は `(currentPage - 1) * PAGE_SIZE` になります。`slice(start, end)` は元の配列を変更せず、end の直前までを取り出します。検索・絞り込み・並び替えの後でページ分割する順番が大切です。

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
  if (loading) {
```

変更後：

```jsx
  const pageCount = Math.ceil(sortedPokemon.length / PAGE_SIZE)
  const currentPage = Math.min(page, Math.max(1, pageCount))
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const visiblePokemon = sortedPokemon.slice(startIndex, startIndex + PAGE_SIZE)

  if (loading) {
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
{sortedPokemon.map((pokemon) => (
```

変更後：

```jsx
{visiblePokemon.map((pokemon) => (
```

**確認：** 最初のページには番号1・2・3が表示され、全体の件数は10匹のままです。

## ステップ3 前後のページへ移動する

`disabled` が true のボタンは操作できません。0件ならナビゲーション自体を出さず、既存の0件メッセージを使います。ページ番号を state に持ち、総ページ数と表示範囲は一覧から計算します。

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
      <div className="pokemon-list">
```

変更後：

```jsx
      {pageCount > 0 && (
        <nav className="pagination" aria-label="一覧のページ">
          <button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>前へ</button>
          <p role="status">{currentPage} / {pageCount} ページ</p>
          <button type="button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>次へ</button>
        </nav>
      )}
      <div className="pokemon-list">
```

`src/styles.css` の末尾に追加します。

```css
.pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
}

button:disabled {
  opacity: 0.5;
  cursor: default;
}
```

**確認：** 次へを3回押すと4ページ目は番号10だけになります。先頭では「前へ」、末尾では「次へ」が無効です。

**予想して確かめる：** `PAGE_SIZE` を2にすると5ページ、5にすると2ページになることを予想してから確かめます。確認後は3に戻し、再読み込みしてください。

## ステップ4 条件が変わったら先頭へ戻す

別のページを見ている最中に条件を変更すると、同じ番号のページが存在しなくなる場合があります。条件を更新する操作でページも1に戻します。Effect で条件の変化を監視する代わりに、操作を受け取る場所でまとめて更新します。表示時の `currentPage` の上限調整も残します。

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
  function toggleType(type) {
```

変更後：

```jsx
  function toggleType(type) {
    setPage(1)
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
  function resetConditions() {
```

変更後：

```jsx
  function resetConditions() {
    setPage(1)
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
          onQueryChange={setQuery}
```

変更後：

```jsx
          onQueryChange={(value) => { setQuery(value); setPage(1) }}
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
          onTypeMatchChange={setTypeMatch}
```

変更後：

```jsx
          onTypeMatchChange={(value) => { setTypeMatch(value); setPage(1) }}
```

`src/App.jsx` の次の部分を変更します。変更前：

```jsx
          onSortChange={setSortOrder}
```

変更後：

```jsx
          onSortChange={(value) => { setSortOrder(value); setPage(1) }}
```

**確認：** 4ページ目から名前に CHAR を入れると1ページ目の3匹になります。存在しない名前は0件で、ページの操作は表示されません。詳細から戻った場合はページが維持されます。

## 小さな練習

検索前に4ページ目へ移動し、ページを戻す処理の1か所を一時的に外した場合に何が起きるか予想してください。`page` と上限調整後の `currentPage` の違いも説明します。確認後は外した処理を戻してください。

## 完成状態の確認

次の操作を試し、変更した値から表示までの流れを説明してください。各ステップの一時的な変更は元に戻してから次章へ進みます。

- 初期表示は番号1・2・3で、次へを押して最後まで進むと番号10だけになる。

- 先頭と末尾の移動ボタンが無効になり、0件ではページ操作が出ない。

- 条件を変えると先頭ページへ戻り、詳細から戻ると元のページが維持される。

自分のコードをビルドする場合は、リポジトリ直下で実行します。

```sh
npm run build
```

完成例を起動する場合は、次を実行します。

```sh
npm run dev:example -- examples/15-pagination
```

完成コードは [src/](../../examples/15-pagination/src/) にあります。前章の完成例と比べ、追加したファイルと変更した箇所を確認できます。

## 参考資料

- [MDN：Array.slice](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/slice)

- [MDN：Math.ceil](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Math/ceil)

[前へ：第14章](14-multi-type-filter.md) / [次へ：第16章](16-apply-cancel-filters.md)
