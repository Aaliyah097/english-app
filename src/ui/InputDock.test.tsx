import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { InputDock } from './InputDock';

describe('InputDock', () => {
  it('fires onSubmit when the send button is clicked', async () => {
    const onSubmit = vi.fn();
    render(
      <InputDock value="hi" onChange={() => {}} onSubmit={onSubmit} cta="Check" />,
    );
    await userEvent.click(screen.getByRole('button', { name: /check/i }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('fires onSubmit when Enter is pressed', async () => {
    const onSubmit = vi.fn();
    render(
      <InputDock
        value="hi"
        onChange={() => {}}
        onSubmit={onSubmit}
        placeholder="type"
      />,
    );
    await userEvent.type(screen.getByLabelText('Translation input'), '{Enter}');
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('does not fire onSubmit when disabled', async () => {
    const onSubmit = vi.fn();
    render(
      <InputDock
        value="hi"
        onChange={() => {}}
        onSubmit={onSubmit}
        cta="Check"
        disabled
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /check/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
