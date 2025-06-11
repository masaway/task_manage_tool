-- timer_started_atカラムを追加
ALTER TABLE tasks
ADD COLUMN timer_started_at TIMESTAMP WITH TIME ZONE; 