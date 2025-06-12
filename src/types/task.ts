export type TaskStatus = 'backlog' | 'in_progress' | 'now' | 'done';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  estimatedHours: number;
  actualHours?: string; // HH:MM:SS形式の文字列（オプショナル）
  createdAt: Date;
  dueDate?: Date;
  isCompleted: boolean;
  startedAt?: Date;
  completedAt?: Date;
  timerStartedAt?: Date; // タイマー開始時間
}

export interface TaskFormData {
  title: string;
  estimatedHours: number;
  dueDate?: Date;
}