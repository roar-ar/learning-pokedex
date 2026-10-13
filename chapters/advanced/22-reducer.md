# 第22章 useReducer

条件の適用・リセット・ページ移動に伴う state の更新を、useReducer で整理します。操作ごとに、次の状態を作る処理をまとめます。

## この章の目標

- 関連する state の更新を、useReducer にまとめる
- 条件の適用・リセット・ページ移動を、action で表す
- 元の state を書き換えず、次の state を返す reducer を作る
- コンポーネントから dispatch を使って操作を伝える
