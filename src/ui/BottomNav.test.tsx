import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { BottomNav } from './BottomNav';

describe('BottomNav', () => {
  it('renders two tabs (Practice + Settings); no Vocabulary, no Progress', () => {
    render(<BottomNav active="practice" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /practice/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /vocabulary/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /progress/i })).not.toBeInTheDocument();
  });

  it('calls onChange with settings when the second tab is clicked', async () => {
    const onChange = vi.fn();
    render(<BottomNav active="practice" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: /settings/i }));
    expect(onChange).toHaveBeenCalledWith('settings');
  });
});
