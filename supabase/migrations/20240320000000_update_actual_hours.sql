-- デフォルト値を一時的に削除
ALTER TABLE tasks
ALTER COLUMN actual_hours DROP DEFAULT;

-- 一時的なカラムを作成
ALTER TABLE tasks
ADD COLUMN actual_hours_new VARCHAR(8);

-- 既存のデータを新しい形式に変換
UPDATE tasks
SET actual_hours_new = 
    LPAD(FLOOR(COALESCE(actual_hours, 0))::text, 2, '0') || ':' || 
    LPAD(FLOOR((COALESCE(actual_hours, 0) * 60) % 60)::text, 2, '0') || ':' || 
    LPAD(FLOOR((COALESCE(actual_hours, 0) * 3600) % 60)::text, 2, '0');

-- 古いカラムを削除
ALTER TABLE tasks
DROP COLUMN actual_hours;

-- 新しいカラムの名前を変更
ALTER TABLE tasks
RENAME COLUMN actual_hours_new TO actual_hours;

-- 新しいデフォルト値を設定
ALTER TABLE tasks
ALTER COLUMN actual_hours SET DEFAULT '00:00:00'; 