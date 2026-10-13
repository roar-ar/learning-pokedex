# Learning Pokédex

React の基本を学ぶためのリポジトリです。JavaScript と JSX を使い、アプリケーションフレームワークは導入していません。Vite は開発サーバーとビルドに使用します。

## 必要なもの

- Node.js 20.19 以上、または 22.12 以上
- npm

## 起動方法

```sh
npm install
npm run dev
```

ターミナルに表示される URL をブラウザで開くと、`Hello World` が表示されます。

## ディレクトリ

- `src/main.jsx`: React の起動処理
- `src/App.jsx`: 最初のコンポーネント
- `src/components/`: 学習を進めながら追加するコンポーネント
- `src/assets/`: JavaScript から読み込む画像など
- `public/`: 変換せずに公開する静的ファイル

本番用ファイルを生成する場合は `npm run build` を実行します。
