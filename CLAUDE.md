# CLAUDE.md

## 最重要ルール - 新しいルールの追加プロセス

ユーザーから今回限りではなく常に対応が必要だと思われる指示を受けた場合：
1. 全て日本語で


## 開発コマンド

- `npm start` - 開発サーバーを起動
- `npm run build` - 本番用ビルド（CI=falseで警告を無視）
- `npm test` - テストを実行
- `npm run lint` - TypeScriptファイルをリント
- `npm run lint:fix` - リントエラーを自動修正
- `npm run lint:strict` - 警告ゼロでリント実行

## 環境設定

以下の内容で`.env`ファイルが必要：
```
REACT_APP_SUPABASE_URL=your-project-url
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

## アーキテクチャ概要

Supabaseバックエンドを使用したReact TypeScriptカンバンタスク管理アプリケーションです。

### コアデータフロー
- **タスク状態**: リアルタイムタイマー機能付きの`useTasks`フックで管理
- **データベース**: Supabase PostgreSQL、snake_caseカラムをフロントエンドでcamelCaseに変換
- **タスクステータス**: `backlog` → `in_progress` → `now` → `done`
- **タイマーロジック**: タスクが'now'ステータスの時に自動時間計測、1分間隔で更新

### 主要コンポーネント
- `KanbanBoard`: @dnd-kitを使用したメインのドラッグ&ドロップインターフェース
- `TaskCard`: タイマー可視化付きの個別タスク表示
- `TaskForm`: タスクの作成と編集
- `useTasks`: CRUD操作とタイマーロジックを処理するコア状態管理フック

### データベーススキーマ
Tasksテーブルはsnake_case（例：`estimated_hours`、`actual_hours`、`timer_started_at`）を使用しますが、フロントエンドでは`useTasks`の変換関数によりcamelCaseを使用します。

### タイマー実装
- 'now'ステータスのタスクは自動的に時間追跡を開始
- `actual_hours`はHH:MM:SS文字列形式で保存
- `timer_started_at`フィールドによりページ更新後もタイマーが継続
- タスクを'now'ステータスから移動時に時間が累積

### 技術スタック
- React 18 with TypeScript
- Material-UI（コンポーネント用）
- @dnd-kit（ドラッグ&ドロップ用）
- Supabase（バックエンド/データベース用）
- React Router（ナビゲーション用）
- Vercelでデプロイ

## 重要な実装詳細

- 時間計算は時間（float）とHH:MM:SS形式間の変換を処理
- データベース更新はドラッグ&ドロップ用に単一操作とバッチ操作の両方を使用
- リアルタイム更新を処理するためタイマー状態はタスク状態と分離して管理
- すべてのデータベースカラム名はフロントエンドでsnake_caseからcamelCaseに変換