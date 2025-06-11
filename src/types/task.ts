export type TaskStatus = 'backlog' | 'todo' | 'now' | 'done';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  estimatedHours: number;
  actualHours: number;
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