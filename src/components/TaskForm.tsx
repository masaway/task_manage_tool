import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
} from '@mui/material';
import { TaskFormData } from '../types/task';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (taskData: TaskFormData) => void;
  initialData?: Partial<TaskFormData>;
  title?: string;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  title = 'タスクを作成'
}) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    estimatedHours: 1,
    dueDate: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // フォームが開かれた時に初期データをセット
  useEffect(() => {
    if (open) {
      setFormData({
        title: initialData?.title || '',
        estimatedHours: initialData?.estimatedHours || 1,
        dueDate: initialData?.dueDate || undefined,
      });
      setErrors({});
    }
  }, [open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'タスク名は必須です';
    }
    
    if (formData.estimatedHours <= 0) {
      newErrors.estimatedHours = '予定時間は0より大きい値を入力してください';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log('Submitting form data:', formData);
    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      estimatedHours: 1,
      dueDate: undefined,
    });
    setErrors({});
    onClose();
  };

  const handleChange = (field: keyof TaskFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3}>
            <TextField
              label="タスク名"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              error={!!errors.title}
              helperText={errors.title}
              fullWidth
              required
              autoFocus
            />

            <FormControl fullWidth>
              <InputLabel htmlFor="estimated-hours">予定時間</InputLabel>
              <OutlinedInput
                id="estimated-hours"
                type="number"
                value={formData.estimatedHours}
                onChange={(e) => handleChange('estimatedHours', parseFloat(e.target.value) || 0)}
                endAdornment={<InputAdornment position="end">時間</InputAdornment>}
                label="予定時間"
                inputProps={{
                  min: 0.1,
                  step: 0.1
                }}
                error={!!errors.estimatedHours}
              />
              {errors.estimatedHours && (
                <Box color="error.main" fontSize="0.75rem" mt={0.5} ml={1.75}>
                  予定時間は0より大きい値を入力してください
                </Box>
              )}
            </FormControl>

            <TextField
              label="期限日（任意）"
              type="date"
              value={formData.dueDate ? formData.dueDate.toISOString().split('T')[0] : ''}
              onChange={(e) => {
                const dateValue = e.target.value ? new Date(e.target.value) : undefined;
                handleChange('dueDate', dateValue);
              }}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              helperText="期限日を設定すると、期限が近づいた際に色が変わります"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            キャンセル
          </Button>
          <Button type="submit" variant="contained" color="primary">
            作成
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};