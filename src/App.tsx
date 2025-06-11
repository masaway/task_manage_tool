import React from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { KanbanBoard } from './components/KanbanBoard';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <KanbanBoard />
    </ThemeProvider>
  );
}

export default App;
