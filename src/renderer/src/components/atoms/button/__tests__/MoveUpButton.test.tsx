import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MoveUpButton } from '../MoveUpButton';

describe('MoveUpButton', () => {
  it('renders icon', () => {
    const { container } = render(<MoveUpButton />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    const { getByRole } = render(<MoveUpButton onClick={handleClick} />);
    fireEvent.click(getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('has aria-label="Move Up"', () => {
    const { getByRole } = render(<MoveUpButton />);
    expect(getByRole('button')).toHaveAttribute('aria-label', 'Move Up');
  });
});
