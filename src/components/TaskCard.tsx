import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, IconButton, Box, Chip } from '@mui/material';
import { DragHandle as DragHandleIcon, Check as CheckIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Task } from '../types/task';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatDate, formatDuration } from '../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete, onEdit, onDelete }) => {
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
    animateLayoutChanges: () => true,
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
  }, [task.status, timerStartTime]);

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
    transition: transition || 'transform 200ms cubic-bezier(0.2, 0, 0, 1)',
    opacity: isDragging ? 0.3 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 1000 : 1,
    boxShadow: isDragging ? '0 8px 16px rgba(0,0,0,0.2)' : 'none',
    width: '100%',
    height: '180px',
    marginBottom: '8px',
  };

  const handleCompleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComplete(task.id);
  };

  return (
    <Card
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      data-id={task.id}
      sx={{
        mb: 2,
        cursor: 'grab',
        '&:active': {
          cursor: 'grabbing',
        },
        ...style,
        '&[data-dragging="true"]': {
          zIndex: 1000,
        },
        '&[data-over="true"]': {
          transform: 'translateY(20px)',
          transition: 'transform 200ms cubic-bezier(0.2, 0, 0, 1)',
        },
      }}
    >
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Typography variant="h6" component="div" gutterBottom sx={{ 
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {task.title}
          </Typography>
          <Box>
            <IconButton size="small" onClick={() => onEdit(task)}>
              <EditIcon />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(task.id)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
        <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
          <Chip
            label={`見積: ${formatDuration(task.estimatedHours)}`}
            size="small"
            color="primary"
            variant="outlined"
          />
          {task.actualHours && (
            <Chip
              label={`実績: ${task.actualHours}`}
              size="small"
              color="secondary"
              variant="outlined"
            />
          )}
          {task.dueDate && (
            <Chip
              label={`期限: ${formatDate(task.dueDate)}`}
              size="small"
              color={task.isCompleted ? 'success' : 'warning'}
              variant="outlined"
            />
          )}
        </Box>
        <Box sx={{ mt: 'auto' }}>
          {task.startedAt && (
            <Typography variant="body2" color="text.secondary">
              作業開始日: {new Date(task.startedAt).toLocaleDateString()}
            </Typography>
          )}
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