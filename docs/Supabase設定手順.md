# Supabase設定手順

## 1. プロジェクトの作成

1. [Supabase](https://supabase.com)にアクセスし、アカウントを作成またはログイン
2. 「New Project」をクリック
3. 以下の情報を入力：
   - Organization: 組織を選択（または新規作成）
   - Name: プロジェクト名（例：task-manage-tool）
   - Database Password: データベースのパスワードを設定
   - Region: 最寄りのリージョンを選択（例：Tokyo (Northeast Asia)）
4. 「Create new project」をクリック

## 2. データベースの設定

### 2.1 テーブルの作成

1. プロジェクトダッシュボードの左メニューから「Table Editor」を選択
2. 「Create a new table」をクリック
3. 以下のSQLを実行してテーブルを作成：

```sql
-- tasksテーブルの作成
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('backlog', 'todo', 'now', 'done')),
    estimated_hours DECIMAL(5,2) NOT NULL CHECK (estimated_hours > 0),
    actual_hours DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (actual_hours >= 0),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP WITH TIME ZONE,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- インデックスの作成
CREATE INDEX tasks_status_idx ON tasks(status);
CREATE INDEX tasks_created_at_idx ON tasks(created_at);
```

### 2.2 RLS（Row Level Security）の設定

1. 左メニューから「Authentication」→「Policies」を選択
2. `tasks`テーブルを選択
3. 「New Policy」をクリック
4. 以下の設定でポリシーを作成：

```sql
-- 開発用：全ての操作を許可
CREATE POLICY "Enable all access for development" ON tasks
    FOR ALL
    USING (true)
    WITH CHECK (true);
```

注意：この設定は開発環境専用です。本番環境では適切なアクセス制御を設定してください。

## 3. 環境変数の設定

1. プロジェクトダッシュボードの左メニューから「Project Settings」→「API」を選択
2. 以下の情報をコピー：
   - Project URL
   - anon/public key

3. プロジェクトのルートディレクトリに`.env`ファイルを作成し、以下の内容を設定：

```
REACT_APP_SUPABASE_URL=your-project-url
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

## 4. 動作確認

1. アプリケーションを起動：
```bash
npm start
```

2. ブラウザで`http://localhost:3000`にアクセス
3. タスクの作成、移動、完了などの操作が正常に動作することを確認

## 5. トラブルシューティング

### 5.1 データベース接続エラー
- 環境変数が正しく設定されているか確認
- Supabaseプロジェクトが有効な状態か確認
- ネットワーク接続を確認

### 5.2 権限エラー
- RLSポリシーが正しく設定されているか確認
- ユーザーが正しく認証されているか確認

### 5.3 その他の問題
- ブラウザのコンソールでエラーメッセージを確認
- Supabaseのダッシュボードでログを確認 