import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders GitHub Repository Cleaner title', () => {
  render(<App />);
  const titleElement = screen.getByText(/GitHub Repository Cleaner/i);
  expect(titleElement).toBeInTheDocument();
});
