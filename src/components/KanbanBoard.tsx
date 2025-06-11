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
  DragOverEvent,
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
import { TaskStatus } from '../types/task';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { useTasks } from '../hooks/useTasks';
import { useNavigate } from 'react-router-dom';

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
        backgroundColor: isOver ? 'rgba(25, 118, 210, 0.08)' : 'rgba(0, 0, 0, 0.03)',
        borderRadius: 1,
        p: 1,
        transition: 'background-color 0.2s ease-in-out',
        border: isOver ? '2px dashed #1976d2' : 'none',
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
  const navigate = useNavigate();

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

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    // タスクカード同士の重なりを検出
    if (active.data.current?.type === 'task' && over.data.current?.type === 'task') {
      const overElement = document.querySelector(`[data-id="${over.id}"]`);
      if (overElement) {
        // 重なっている要素にdata-over属性を設定
        overElement.setAttribute('data-over', 'true');
      }
    } else {
      // 重なっていない場合は、すべてのdata-over属性を削除
      document.querySelectorAll('[data-over="true"]').forEach(element => {
        element.removeAttribute('data-over');
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    // すべてのタスクカードからdata-over属性を削除
    document.querySelectorAll('[data-over="true"]').forEach(element => {
      element.removeAttribute('data-over');
    });

    console.log('Drag ended:', {
      activeTaskId: active.id,
      overId: over?.id,
      overData: over?.data.current
    });

    if (!over) return;

    const activeTask = tasks.find(task => task.id === active.id);
    const targetStatus = over.data.current?.type === 'column' 
      ? over.data.current.status as TaskStatus
      : over.data.current?.type === 'task'
        ? tasks.find(task => task.id === over.id)?.status as TaskStatus
        : null;

    if (activeTask && targetStatus && activeTask.status !== targetStatus) {
      if (targetStatus === 'now') {
        const existingNowTask = tasks.find(task => task.status === 'now');
        if (existingNowTask) {
          console.log('Moving existing now task to in_progress and new task to now');
          updateMultipleTaskStatuses([
            { taskId: existingNowTask.id, newStatus: 'in_progress' },
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" component="h1">
            Ittō
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate('/concept')}
          >
            コンセプト
          </Button>
        </Box>
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
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        modifiers={[]}
        autoScroll={false}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
        collisionDetection={closestCenter}
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
                        onEdit={(task) => updateTaskStatus(task.id, task.status)}
                        onDelete={() => {}}
                      />
                    ))}
                  </SortableContext>
                </DroppableColumn>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <DragOverlay dropAnimation={{
          duration: 200,
          easing: 'cubic-bezier(0.2, 0, 0, 1)',
        }}>
          {activeId ? (
            <TaskCard
              task={tasks.find(task => task.id === activeId)!}
              onComplete={completeTask}
              onEdit={(task) => updateTaskStatus(task.id, task.status)}
              onDelete={() => {}}
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