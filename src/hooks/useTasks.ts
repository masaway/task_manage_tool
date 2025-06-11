import { useState, useEffect } from 'react';
import { Task, TaskFormData } from '../types/task';
import { supabase } from '../services/supabase';

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

  useEffect(() => {
    fetchTasks();
  }, []);

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
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (updateError) throw updateError;

      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
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