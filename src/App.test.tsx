import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders the wordmark', () => {
    render(<App />);
    expect(screen.getByText('Englishly')).toBeInTheDocument();
    expect(screen.getByText(/v0\.1/i)).toBeInTheDocument();
  });
});
