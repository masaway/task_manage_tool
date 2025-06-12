# Ittō（一灯） - タスク管理ツール

暗闇に灯る、ただ一つの光をイメージしたカンバン形式のタスク管理アプリケーションです。

## 概要
このアプリケーションは、カンバン形式による直感的なタスク管理を実現するWebアプリケーションです。
作業工数の正確な計測と可視化、シンプルで使いやすいUI/UXを提供します。

## 主な機能
- カンバン形式のタスク管理（Backlog, In Progress, Now, Done）
- タスクの作業時間の自動計測
- ドラッグ＆ドロップによるタスク移動
- タスクの新規作成・編集・完了処理
- "Now"列には1つのタスクのみ配置可能（集中力向上）

## 技術スタック
- フロントエンド: React (TypeScript)
- UI ライブラリ: Material-UI
- ドラッグ&ドロップ: @dnd-kit
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
4. 右下の「+」ボタンで新しいタスクを作成

## データベース設定
Supabaseでtasksテーブルを作成する必要があります：

```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('backlog', 'in_progress', 'now', 'done')),
    estimated_hours DECIMAL(5,2) NOT NULL CHECK (estimated_hours > 0),
    actual_hours VARCHAR(8) NOT NULL DEFAULT '00:00:00',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP WITH TIME ZONE,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    timer_started_at TIMESTAMP WITH TIME ZONE
);

-- インデックスの作成
CREATE INDEX tasks_status_idx ON tasks(status);
CREATE INDEX tasks_created_at_idx ON tasks(created_at);
```

## 開発コマンド
- `npm start` - 開発サーバーを起動
- `npm run build` - 本番用ビルド（CI=falseで警告を無視）
- `npm test` - テストを実行
- `npm run lint` - TypeScriptファイルをリント
- `npm run lint:fix` - リントエラーを自動修正
- `npm run lint:strict` - 警告ゼロでリント実行

## ライセンス
このプロジェクトはMITライセンスの下で公開されています。