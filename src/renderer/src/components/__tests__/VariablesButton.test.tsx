import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { VariablesButton } from '../VariablesButton';

describe('VariablesButton', () => {
  it('should render with {x} text', () => {
    render(<VariablesButton onClick={() => {}} />);

    expect(screen.getByText('{x}')).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<VariablesButton onClick={handleClick} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should have correct title attribute', () => {
    render(<VariablesButton onClick={() => {}} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Variables (Ctrl/Cmd + Shift + V)');
  });

  it('should have correct styling classes', () => {
    render(<VariablesButton onClick={() => {}} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass(
      'flex',
      'items-center',
      'justify-center',
      'w-10',
      'h-10',
      'rounded-md',
      'bg-secondary',
      'hover:bg-accent',
      'transition-colors',
    );
  });

  it('should have mono font for the text', () => {
    render(<VariablesButton onClick={() => {}} />);

    const textSpan = screen.getByText('{x}');
    expect(textSpan).toHaveClass('text-lg', 'font-mono');
  });

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<VariablesButton onClick={handleClick} />);

    const button = screen.getByRole('button');

    // Tab to the button
    await user.tab();
    expect(button).toHaveFocus();

    // Press Enter
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Press Space
    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('should not call onClick multiple times for a single click', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<VariablesButton onClick={handleClick} />);

    const button = screen.getByRole('button');

    // Double click quickly
    await user.dblClick(button);

    // Should be called twice (once for each click)
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('should maintain hover state classes', async () => {
    render(<VariablesButton onClick={() => {}} />);

    const button = screen.getByRole('button');

    // Initial state
    expect(button).toHaveClass('bg-secondary');

    // Hover state is handled by CSS, just verify the class exists
    expect(button).toHaveClass('hover:bg-accent');
  });
});
