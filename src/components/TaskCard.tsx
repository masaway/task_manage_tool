import React from 'react';
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
            作業時間: {task.actualHours}時間
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}; 