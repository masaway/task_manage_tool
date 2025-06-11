# タスク管理ツール

## 概要
このアプリケーションは、カンバン形式による直感的なタスク管理を実現するWebアプリケーションです。
作業工数の正確な計測と可視化、シンプルで使いやすいUI/UXを提供します。

## 主な機能
- カンバン形式のタスク管理（Backlog, Todo, Now, Done）
- タスクの作業時間の自動計測
- ドラッグ＆ドロップによるタスク移動
- タスクの新規作成・編集・完了処理

## 技術スタック
- フロントエンド: React (TypeScript)
- バックエンド: Supabase
- データベース: PostgreSQL (Supabase)

## 開発環境のセットアップ

### 必要条件
- Node.js (v16以上)
- npm (v7以上)
- Supabaseアカウント

### 環境変数の設定
1. プロジェクトのルートディレクトリに`.env`ファイルを作成
2. 以下の環境変数を設定：
```
REACT_APP_SUPABASE_URL=your-project-url
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### インストール手順
1. リポジトリのクローン
```bash
git clone [リポジトリURL]
cd task-manage-tool
```

2. 依存パッケージのインストール
```bash
npm install
```

3. 開発サーバーの起動
```bash
npm start
```

## 使用方法
1. ブラウザで `http://localhost:3000` にアクセス
2. カンバンボード上でタスクの作成・移動・編集が可能
3. タスクを「Now」ステータスに移動すると自動的に時間計測が開始

## ライセンス
このプロジェクトはMITライセンスの下で公開されています。
