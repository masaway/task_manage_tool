import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { KanbanBoard } from './components/KanbanBoard';
import { Concept } from './pages/Concept';

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
      <Router>
        <Routes>
          <Route path="/" element={<KanbanBoard />} />
          <Route path="/concept" element={<Concept />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
