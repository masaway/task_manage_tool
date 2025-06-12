import { useState, useEffect } from 'react';
import { Task, TaskFormData } from '../types/task';
import { supabase, isSupabaseConfigured } from '../services/supabase';

// 時間をHH:MM:SS形式に変換する関数
const formatTimeToHHMMSS = (hours: number): string => {
  const totalSeconds = Math.floor(hours * 3600);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// HH:MM:SS形式の文字列を時間に変換する関数
const parseHHMMSSToHours = (timeStr: string | undefined): number => {
  if (!timeStr) return 0;
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  return hours + minutes / 60 + seconds / 3600;
};

// スネークケースからキャメルケースへの変換関数
const convertToCamelCase = (data: any): Task => {
  return {
    id: data.id,
    title: data.title,
    status: data.status,
    estimatedHours: data.estimated_hours,
    actualHours: data.actual_hours || '00:00:00',
    createdAt: new Date(data.created_at),
    dueDate: data.due_date ? new Date(data.due_date) : undefined,
    isCompleted: data.is_completed,
    startedAt: data.started_at ? new Date(data.started_at) : undefined,
    completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
    timerStartedAt: data.timer_started_at ? new Date(data.timer_started_at) : undefined,
  };
};

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timerStartTime, setTimerStartTime] = useState<Date | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(!isSupabaseConfigured());

  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchTasks();
    } else {
      // オフラインモード - ダミーデータで初期化
      setIsOfflineMode(true);
      setLoading(false);
      setError('Supabaseが設定されていません。オフラインモードで動作しています。');
    }
  }, []);

  // タイマーの更新処理
  useEffect(() => {
    const nowTask = tasks.find(task => task.status === 'now');
    if (nowTask) {
      if (!timerStartTime) {
        // タイマー開始時間が保存されている場合はそれを使用
        if (nowTask.timerStartedAt) {
          setTimerStartTime(new Date(nowTask.timerStartedAt));
        } else {
          // 新しくタイマーを開始
          const startTime = new Date();
          setTimerStartTime(startTime);
          // データベースに開始時間を保存
          supabase
            .from('tasks')
            .update({ timer_started_at: startTime.toISOString() })
            .eq('id', nowTask.id)
            .then(({ error }) => {
              if (error) console.error('タイマー開始時間の保存に失敗:', error);
            });
        }
      }
    } else {
      setTimerStartTime(null);
    }
  }, [tasks, timerStartTime]);

  // 1分ごとに作業時間を更新
  useEffect(() => {
    if (!timerStartTime) return;

    const interval = setInterval(async () => {
      const nowTask = tasks.find(task => task.status === 'now');
      if (!nowTask) return;

      const elapsedHours = (new Date().getTime() - timerStartTime.getTime()) / (1000 * 60 * 60);
      const currentHours = parseHHMMSSToHours(nowTask.actualHours);
      const newActualHours = currentHours + elapsedHours;
      const formattedTime = formatTimeToHHMMSS(newActualHours);

      try {
        const { error: updateError } = await supabase
          .from('tasks')
          .update({ actual_hours: formattedTime })
          .eq('id', nowTask.id);

        if (updateError) throw updateError;

        setTasks(tasks.map(task =>
          task.id === nowTask.id ? { ...task, actualHours: formattedTime } : task
        ));
        setTimerStartTime(new Date());
      } catch (err) {
        console.error('作業時間の更新に失敗:', err);
      }
    }, 60000); // 1分ごとに更新

    return () => clearInterval(interval);
  }, [timerStartTime, tasks]);

  const fetchTasks = async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        const convertedTasks = data.map(convertToCamelCase);
        setTasks(convertedTasks);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'タスクの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: TaskFormData) => {
    console.log('Creating task:', taskData);
    if (!isSupabaseConfigured()) {
      // オフラインモード - ローカルでタスク作成
      const newTask: Task = {
        id: Date.now().toString(),
        title: taskData.title,
        status: 'backlog',
        estimatedHours: taskData.estimatedHours,
        actualHours: '00:00:00',
        createdAt: new Date(),
        dueDate: taskData.dueDate,
        isCompleted: false,
      };
      console.log('New task created:', newTask);
      setTasks([newTask, ...tasks]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            title: taskData.title,
            status: 'backlog',
            estimated_hours: taskData.estimatedHours,
            due_date: taskData.dueDate,
            is_completed: false,
            actual_hours: '00:00:00'
          },
        ])
        .select();

      if (error) throw error;
      if (data) {
        const convertedTask = convertToCamelCase(data[0]);
        setTasks([...tasks, convertedTask]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'タスクの作成に失敗しました');
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (!isSupabaseConfigured()) {
      // オフラインモード - ローカルでステータス更新
      setTasks(tasks.map(t => 
        t.id === taskId ? { ...t, status: newStatus } : t
      ));
      return;
    }

    try {
      // ステータスがnowから変更される場合、作業時間を更新
      if (task.status === 'now' && newStatus !== 'now') {
        const elapsedHours = timerStartTime ? 
          (new Date().getTime() - timerStartTime.getTime()) / (1000 * 60 * 60) : 0;
        const currentHours = parseHHMMSSToHours(task.actualHours);
        const newActualHours = currentHours + elapsedHours;
        const formattedTime = formatTimeToHHMMSS(newActualHours);

        console.log('Updating task time:', {
          taskId,
          currentTime: task.actualHours,
          elapsedHours,
          newTime: formattedTime
        });

        const { error: updateError } = await supabase
          .from('tasks')
          .update({ 
            status: newStatus,
            actual_hours: formattedTime,
            timer_started_at: null // タイマー開始時間をクリア
          })
          .eq('id', taskId);

        if (updateError) throw updateError;

        setTasks(tasks.map(t => 
          t.id === taskId ? { ...t, status: newStatus, actualHours: formattedTime, timerStartedAt: undefined } : t
        ));
        setTimerStartTime(null);
      } else {
        const { error: updateError } = await supabase
          .from('tasks')
          .update({ status: newStatus })
          .eq('id', taskId);

        if (updateError) throw updateError;

        setTasks(tasks.map(t => 
          t.id === taskId ? { ...t, status: newStatus } : t
        ));
      }
    } catch (err) {
      console.error('タスクの更新に失敗:', err);
      setError(err instanceof Error ? err.message : 'タスクの更新に失敗しました');
      await fetchTasks();
    }
  };

  const updateMultipleTaskStatuses = async (updates: { taskId: string; newStatus: Task['status'] }[]) => {
    if (!isSupabaseConfigured()) {
      // オフラインモード - ローカルで一括更新
      setTasks(currentTasks => {
        const taskMap = new Map(currentTasks.map(task => [task.id, task]));
        updates.forEach(({ taskId, newStatus }) => {
          const task = taskMap.get(taskId);
          if (task) {
            taskMap.set(taskId, { ...task, status: newStatus });
          }
        });
        return Array.from(taskMap.values());
      });
      return;
    }

    try {
      // 時間更新が必要なタスクを特定
      const timeUpdates = updates.map(({ taskId, newStatus }) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return { taskId, newStatus };
        
        if (task.status === 'now' && newStatus !== 'now') {
          const elapsedHours = timerStartTime ? 
            (new Date().getTime() - timerStartTime.getTime()) / (1000 * 60 * 60) : 0;
          const currentHours = parseHHMMSSToHours(task.actualHours || '00:00:00');
          const newActualHours = currentHours + elapsedHours;
          const formattedTime = formatTimeToHHMMSS(newActualHours);

          console.log('Updating multiple task times:', {
            taskId,
            currentTime: task.actualHours || '00:00:00',
            elapsedHours,
            newTime: formattedTime
          });

          return {
            taskId,
            newStatus,
            actualHours: formattedTime
          } as const;
        }
        return { taskId, newStatus } as const;
      });

      // データベースの更新
      const updatePromises = timeUpdates.map(update => {
        if ('actualHours' in update) {
          return supabase
            .from('tasks')
            .update({ 
              status: update.newStatus,
              actual_hours: update.actualHours
            })
            .eq('id', update.taskId);
        } else {
          return supabase
            .from('tasks')
            .update({ status: update.newStatus })
            .eq('id', update.taskId);
        }
      });

      await Promise.all(updatePromises);

      // ローカルの状態更新
      setTasks(currentTasks => {
        const taskMap = new Map(currentTasks.map(task => [task.id, task]));
        timeUpdates.forEach(update => {
          const task = taskMap.get(update.taskId);
          if (task) {
            if ('actualHours' in update) {
              taskMap.set(update.taskId, { 
                ...task, 
                status: update.newStatus,
                actualHours: update.actualHours
              });
            } else {
              taskMap.set(update.taskId, { 
                ...task, 
                status: update.newStatus 
              });
            }
          }
        });
        return Array.from(taskMap.values());
      });

      // タイマーをリセット
      if (timeUpdates.some(update => 'actualHours' in update)) {
        setTimerStartTime(null);
      }
    } catch (err) {
      console.error('タスクの一括更新に失敗:', err);
      setError(err instanceof Error ? err.message : 'タスクの一括更新に失敗しました');
      await fetchTasks();
    }
  };

  const completeTask = async (taskId: string) => {
    if (!isSupabaseConfigured()) {
      // オフラインモード - ローカルで完了処理
      setTasks(tasks.map(t => 
        t.id === taskId ? { ...t, isCompleted: true, completedAt: new Date() } : t
      ));
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.map(t => 
        t.id === taskId ? { ...t, isCompleted: true, completedAt: new Date() } : t
      ));
    } catch (err) {
      console.error('タスクの完了に失敗:', err);
      setError(err instanceof Error ? err.message : 'タスクの完了に失敗しました');
    }
  };

  return {
    tasks,
    loading,
    error,
    isOfflineMode,
    createTask,
    updateTaskStatus,
    updateMultipleTaskStatuses,
    completeTask,
  };
};