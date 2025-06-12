import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  DragIndicator,
  CheckCircle,
  Schedule,
  Timer,
} from '@mui/icons-material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../types/task';
import { formatDate, formatTime, calculateDaysUntilDue } from '../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'backlog':
        return 'default';
      case 'in_progress':
        return 'info';
      case 'now':
        return 'warning';
      case 'done':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'backlog':
        return 'Backlog';
      case 'in_progress':
        return 'In Progress';
      case 'now':
        return 'Now';
      case 'done':
        return 'Done';
      default:
        return status;
    }
  };

  const calculateProgress = () => {
    if (!task.actualHours || task.estimatedHours === 0) return 0;
    const actualMinutes = task.actualHours.split(':').reduce((acc, time, index) => {
      return acc + parseInt(time) * [60, 1, 1/60][index];
    }, 0);
    const actualHours = actualMinutes / 60;
    return Math.min((actualHours / task.estimatedHours) * 100, 100);
  };

  const getDueDateChip = () => {
    if (!task.dueDate) return null;
    
    const daysUntilDue = calculateDaysUntilDue(task.dueDate);
    let color: 'default' | 'warning' | 'error' = 'default';
    
    if (daysUntilDue < 0) {
      color = 'error';
    } else if (daysUntilDue <= 3) {
      color = 'warning';
    }

    return (
      <Chip
        size="small"
        icon={<Schedule />}
        label={`期限: ${formatDate(task.dueDate)}`}
        color={color}
        variant={daysUntilDue < 0 ? 'filled' : 'outlined'}
      />
    );
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      sx={{
        mb: 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        '&:hover': {
          boxShadow: 3,
        },
        border: task.status === 'now' ? '2px solid #ff9800' : '1px solid #e0e0e0',
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box display="flex" alignItems="flex-start" mb={1}>
          <IconButton
            size="small"
            {...attributes}
            {...listeners}
            sx={{ 
              p: 0.5, 
              mr: 1, 
              cursor: isDragging ? 'grabbing' : 'grab',
              color: 'text.secondary'
            }}
          >
            <DragIndicator />
          </IconButton>
          <Box flexGrow={1}>
            <Typography
              variant="subtitle2"
              component="h3"
              gutterBottom
              sx={{
                fontWeight: 600,
                lineHeight: 1.2,
                mb: 1,
              }}
            >
              {task.title}
            </Typography>
            <Chip
              size="small"
              label={getStatusLabel(task.status)}
              color={getStatusColor(task.status)}
              sx={{ mb: 1 }}
            />
          </Box>
          {task.status !== 'done' && !task.isCompleted && (
            <IconButton
              size="small"
              onClick={() => onComplete(task.id)}
              sx={{ color: 'success.main' }}
            >
              <CheckCircle />
            </IconButton>
          )}
        </Box>

        <Box mb={1}>
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <Timer sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              作業時間: {formatTime(task.actualHours || '00:00:00')} / {task.estimatedHours}h
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={calculateProgress()}
            sx={{
              height: 4,
              borderRadius: 2,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 2,
                bgcolor: task.status === 'now' ? 'warning.main' : 'primary.main',
              },
            }}
          />
        </Box>

        <Box display="flex" flexDirection="column" gap={0.5}>
          {getDueDateChip()}
          <Typography variant="caption" color="text.secondary">
            作成日: {formatDate(task.createdAt)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};