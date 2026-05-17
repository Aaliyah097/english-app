import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Chip } from './Chip';

describe('Chip', () => {
  it('renders children', () => {
    render(<Chip>hello</Chip>);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('renders every tone without crashing', () => {
    const tones = ['neutral', 'accent', 'good', 'warn', 'ink'] as const;
    for (const tone of tones) {
      render(<Chip tone={tone}>{tone}</Chip>);
      expect(screen.getByText(tone)).toBeInTheDocument();
    }
  });
});
