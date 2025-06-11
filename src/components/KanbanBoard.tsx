import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert,
  GridProps,
} from '@mui/material';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Task, TaskStatus } from '../types/task';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { useTasks } from '../hooks/useTasks';

const COLUMN_TITLES: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  todo: 'Todo',
  now: 'Now',
  done: 'Done',
};

const STATUS_COLUMNS: TaskStatus[] = ['backlog', 'todo', 'now', 'done'];

export const KanbanBoard: React.FC = () => {
  const { tasks, loading, error, createTask, updateTaskStatus, completeTask } = useTasks();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTask = tasks.find(task => task.id === active.id);
    const overStatus = over.id as TaskStatus;

    if (activeTask && activeTask.status !== overStatus) {
      updateTaskStatus(activeTask.id, overStatus);
    }
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          タスク管理ボード
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsFormOpen(true)}
        >
          新規タスク作成
        </Button>
      </Box>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Grid container spacing={2}>
          {STATUS_COLUMNS.map((status) => (
            <Grid item xs={12} sm={6} md={3} key={status} {...({} as GridProps)}>
              <Paper
                sx={{
                  p: 2,
                  minHeight: '70vh',
                  backgroundColor: '#f5f5f5',
                }}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {COLUMN_TITLES[status]}
                </Typography>
                <SortableContext
                  items={getTasksByStatus(status).map(task => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Box
                    sx={{
                      minHeight: '60vh',
                      backgroundColor: 'rgba(0, 0, 0, 0.03)',
                      borderRadius: 1,
                      p: 1,
                    }}
                    id={status}
                  >
                    {getTasksByStatus(status).map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onComplete={completeTask}
                      />
                    ))}
                  </Box>
                </SortableContext>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <DragOverlay>
          {activeId ? (
            <TaskCard
              task={tasks.find(task => task.id === activeId)!}
              onComplete={completeTask}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={createTask}
      />
    </Box>
  );
}; 