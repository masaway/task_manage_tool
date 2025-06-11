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
  useDroppable,
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

interface DroppableColumnProps {
  status: TaskStatus;
  children: React.ReactNode;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({ status, children }) => {
  const { setNodeRef } = useDroppable({
    id: `column-${status}`,
    data: {
      type: 'column',
      status,
    },
  });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        minHeight: '60vh',
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        borderRadius: 1,
        p: 1,
      }}
    >
      {children}
    </Box>
  );
};

export const KanbanBoard: React.FC = () => {
  const { tasks, loading, error, createTask, updateTaskStatus, updateMultipleTaskStatuses, completeTask } = useTasks();
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
    const { active } = event;
    setActiveId(active.id as string);
    console.log('Drag started:', {
      taskId: active.id,
      task: tasks.find(task => task.id === active.id)
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    console.log('Drag ended:', {
      activeTaskId: active.id,
      overId: over?.id,
      overData: over?.data.current
    });

    if (!over) return;

    const activeTask = tasks.find(task => task.id === active.id);
    const targetStatus = over.data.current?.type === 'column' 
      ? over.data.current.status as TaskStatus
      : null;

    if (activeTask && targetStatus && activeTask.status !== targetStatus) {
      if (targetStatus === 'now') {
        const existingNowTask = tasks.find(task => task.status === 'now');
        if (existingNowTask) {
          console.log('Moving existing now task to todo and new task to now');
          updateMultipleTaskStatuses([
            { taskId: existingNowTask.id, newStatus: 'todo' },
            { taskId: activeTask.id, newStatus: 'now' }
          ]);
          return;
        }
      }

      console.log('Updating task status:', {
        taskId: activeTask.id,
        currentStatus: activeTask.status,
        newStatus: targetStatus
      });
      updateTaskStatus(activeTask.id, targetStatus);
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
                <DroppableColumn status={status}>
                  <SortableContext
                    items={getTasksByStatus(status).map(task => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {getTasksByStatus(status).map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onComplete={completeTask}
                      />
                    ))}
                  </SortableContext>
                </DroppableColumn>
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