import { useState, useEffect } from 'react';
import { Task, TaskFormData } from '../types/task';
import { supabase } from '../services/supabase';

// 時間をHH:MM:SS形式に変換する関数
const formatTimeToHHMMSS = (hours: number): string => {
  const totalSeconds = Math.floor(hours * 3600);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// HH:MM:SS形式の文字列を時間に変換する関数
const parseHHMMSSToHours = (timeStr: string): number => {
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
    actualHours: data.actual_hours,
    createdAt: new Date(data.created_at),
    dueDate: data.due_date ? new Date(data.due_date) : undefined,
    isCompleted: data.is_completed,
    startedAt: data.started_at ? new Date(data.started_at) : undefined,
    completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
  };
};

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timerStartTime, setTimerStartTime] = useState<Date | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  // タイマーの更新処理
  useEffect(() => {
    const nowTask = tasks.find(task => task.status === 'now');
    if (nowTask && !timerStartTime) {
      setTimerStartTime(new Date());
    } else if (!nowTask && timerStartTime) {
      setTimerStartTime(null);
    }
  }, [tasks]);

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
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // ステータスがnowから変更される場合、作業時間を更新
      if (task.status === 'now' && newStatus !== 'now' && timerStartTime) {
        const elapsedHours = (new Date().getTime() - timerStartTime.getTime()) / (1000 * 60 * 60);
        const currentHours = parseHHMMSSToHours(task.actualHours);
        const newActualHours = currentHours + elapsedHours;
        const formattedTime = formatTimeToHHMMSS(newActualHours);

        const { error: updateError } = await supabase
          .from('tasks')
          .update({ 
            status: newStatus,
            actual_hours: formattedTime
          })
          .eq('id', taskId);

        if (updateError) throw updateError;

        setTasks(tasks.map(t => 
          t.id === taskId ? { ...t, status: newStatus, actualHours: formattedTime } : t
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
    try {
      // データベースの更新
      const updatePromises = updates.map(({ taskId, newStatus }) =>
        supabase
          .from('tasks')
          .update({ status: newStatus })
          .eq('id', taskId)
      );

      await Promise.all(updatePromises);

      // ローカルの状態更新
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
    } catch (err) {
      console.error('タスクの一括更新に失敗:', err);
      setError(err instanceof Error ? err.message : 'タスクの一括更新に失敗しました');
      await fetchTasks();
    }
  };

  const completeTask = async (taskId: string) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) throw error;

      const { error: updateError } = await supabase
        .from('tasks')
        .update({ 
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (updateError) throw updateError;

      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, isCompleted: true } : task
      ));
    } catch (err) {
      console.error('タスクの完了処理に失敗:', err);
      setError(err instanceof Error ? err.message : 'タスクの完了処理に失敗しました');
      await fetchTasks();
    }
  };

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTaskStatus,
    updateMultipleTaskStatuses,
    completeTask,
  };
}; 