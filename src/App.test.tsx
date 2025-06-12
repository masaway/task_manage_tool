import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Ittō application', () => {
  render(<App />);
  const linkElement = screen.getByText(/Ittō（一灯）/i);
  expect(linkElement).toBeInTheDocument();
});