export type TaskStatus = 'backlog' | 'todo' | 'now' | 'done';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  estimatedHours: number;
  actualHours: string; // HH:MM:SS形式の文字列
  createdAt: Date;
  dueDate?: Date;
  isCompleted: boolean;
  startedAt?: Date;
  completedAt?: Date;
}

export interface TaskFormData {
  title: string;
  estimatedHours: number;
  dueDate?: Date;
} 