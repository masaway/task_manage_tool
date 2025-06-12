import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Fab,
  AppBar,
  Toolbar,
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
  MeasuringStrategy,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Add } from '@mui/icons-material';
import { TaskStatus, Task } from '../types/task';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { useTasks } from '../hooks/useTasks';

const COLUMN_TITLES: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  in_progress: 'In Progress',
  now: 'Now',
  done: 'Done',
};

const STATUS_COLUMNS: TaskStatus[] = ['backlog', 'in_progress', 'now', 'done'];

interface DroppableColumnProps {
  status: TaskStatus;
  children: React.ReactNode;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({ status, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <Paper
      ref={setNodeRef}
      elevation={2}
      sx={{
        p: 2,
        minHeight: 400,
        bgcolor: isOver ? 'action.hover' : 'background.paper',
        border: isOver ? '2px dashed #1976d2' : '1px solid #e0e0e0',
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <Typography
        variant="h6"
        component="h2"
        gutterBottom
        sx={{
          fontWeight: 600,
          color: status === 'now' ? 'warning.main' : 'text.primary',
          borderBottom: '2px solid',
          borderColor: status === 'now' ? 'warning.main' : 'divider',
          pb: 1,
          mb: 2,
        }}
      >
        {COLUMN_TITLES[status]}
      </Typography>
      {children}
    </Paper>
  );
};

export const KanbanBoard: React.FC = () => {
  const { tasks, loading, error, isOfflineMode, createTask, updateTaskStatus, updateMultipleTaskStatuses, completeTask } = useTasks();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
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
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;
    const task = tasks.find(t => t.id === taskId);

    if (!task || task.status === newStatus) return;

    // Nowカラムに移動する場合の特別な処理
    if (newStatus === 'now') {
      const currentNowTask = tasks.find(t => t.status === 'now');
      
      if (currentNowTask && currentNowTask.id !== taskId) {
        // 既存のNowタスクをIn Progressに移動し、新しいタスクをNowに移動
        updateMultipleTaskStatuses([
          { taskId: currentNowTask.id, newStatus: 'in_progress' },
          { taskId, newStatus: 'now' }
        ]);
      } else {
        updateTaskStatus(taskId, newStatus);
      }
    } else {
      updateTaskStatus(taskId, newStatus);
    }
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h5" component="h1" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Ittō（一灯）
          </Typography>
          <Typography variant="subtitle1" color="inherit" sx={{ opacity: 0.8 }}>
            暗闇に灯る、ただ一つの光
          </Typography>
        </Toolbar>
      </AppBar>

      <Box p={3}>
        {isOfflineMode && (
          <Alert severity="info" sx={{ mb: 3 }}>
            オフラインモードで動作しています。Supabaseを設定すると、データが永続化されます。
          </Alert>
        )}
        {error && !isOfflineMode && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          measuring={{
            droppable: {
              strategy: MeasuringStrategy.Always,
            },
          }}
        >
          <Grid container spacing={3}>
            {STATUS_COLUMNS.map((status) => {
              const statusTasks = getTasksByStatus(status);
              return (
                <Grid item xs={12} sm={6} md={3} key={status}>
                  <DroppableColumn status={status}>
                    <SortableContext
                      items={statusTasks.map(task => task.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {statusTasks.length === 0 ? (
                        <Box
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          minHeight={200}
                          color="text.secondary"
                        >
                          <Typography variant="body2">
                            {status === 'backlog' ? 'タスクを追加してください' : 'タスクはありません'}
                          </Typography>
                        </Box>
                      ) : (
                        statusTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onComplete={completeTask}
                          />
                        ))
                      )}
                    </SortableContext>
                  </DroppableColumn>
                </Grid>
              );
            })}
          </Grid>

          <DragOverlay>
            {activeTask ? (
              <TaskCard task={activeTask} onComplete={() => {}} />
            ) : null}
          </DragOverlay>
        </DndContext>

        <Fab
          color="primary"
          aria-label="add task"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
          }}
          onClick={() => setIsTaskFormOpen(true)}
        >
          <Add />
        </Fab>

        <TaskForm
          open={isTaskFormOpen}
          onClose={() => setIsTaskFormOpen(false)}
          onSubmit={createTask}
        />
      </Box>
    </Box>
  );
};