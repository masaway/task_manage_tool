import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, IconButton, Box } from '@mui/material';
import { DragHandle as DragHandleIcon, Check as CheckIcon } from '@mui/icons-material';
import { Task } from '../types/task';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete }) => {
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [timerStartTime, setTimerStartTime] = useState<Date | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  // タイマーの更新処理
  useEffect(() => {
    if (task.status === 'now') {
      if (!timerStartTime) {
        setTimerStartTime(new Date());
      }
    } else {
      setTimerStartTime(null);
      setElapsedTime(0);
    }
  }, [task.status]);

  // 1秒ごとに経過時間を更新
  useEffect(() => {
    if (!timerStartTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = (now.getTime() - timerStartTime.getTime()) / 1000;
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [timerStartTime]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleCompleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComplete(task.id);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        mb: 2,
        backgroundColor: task.isCompleted ? '#f5f5f5' : 'white',
        cursor: 'grab',
        '&:active': {
          cursor: 'grabbing',
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <DragHandleIcon />
          {!task.isCompleted && (
            <IconButton
              size="small"
              onClick={handleCompleteClick}
              sx={{ color: 'success.main' }}
            >
              <CheckIcon />
            </IconButton>
          )}
        </Box>

        <Typography variant="h6" component="div" sx={{ mt: 1 }}>
          {task.title}
        </Typography>
        <Box sx={{ mt: 1 }}>
          {task.startedAt && (
            <Typography variant="body2" color="text.secondary">
              作業開始日: {new Date(task.startedAt).toLocaleDateString()}
            </Typography>
          )}
          {task.dueDate && (
            <Typography variant="body2" color="text.secondary">
              期限日時: {new Date(task.dueDate).toLocaleDateString()}
            </Typography>
          )}
          <Typography variant="body2" color="text.secondary">
            予定時間: {task.estimatedHours}時間
          </Typography>
          <Typography variant="body2" color="text.secondary">
            累計作業時間: {task.actualHours}
          </Typography>
          {task.status === 'now' && (
            <Typography variant="body2" color="primary" sx={{ mt: 1, fontWeight: 'bold' }}>
              現在の作業時間: {formatTime(elapsedTime)}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}; 