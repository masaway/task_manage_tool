import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from '@mui/material';
import { TaskFormData } from '../types/task';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (taskData: TaskFormData) => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ open, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      estimatedHours: parseFloat(estimatedHours),
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setEstimatedHours('');
    setDueDate('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>新規タスク作成</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="タスク名"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="予定時間（時間）"
              type="number"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              required
              fullWidth
              inputProps={{ min: 0, step: 0.5 }}
            />
            <TextField
              label="期限"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>キャンセル</Button>
          <Button type="submit" variant="contained" color="primary">
            作成
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 