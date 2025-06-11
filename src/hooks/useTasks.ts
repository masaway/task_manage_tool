import { useState, useEffect } from 'react';
import { Task, TaskFormData } from '../types/task';
import { supabase } from '../services/supabase';

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
      if (data) setTasks(data);
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
      if (data) setTasks([...tasks, data[0]]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'タスクの作成に失敗しました');
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) throw error;

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
      // エラーが発生した場合は、タスクリストを再取得
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
      // エラーが発生した場合は、タスクリストを再取得
      await fetchTasks();
    }
  };

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTaskStatus,
    completeTask,
  };
}; 