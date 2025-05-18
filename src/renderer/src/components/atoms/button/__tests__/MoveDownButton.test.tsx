import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MoveDownButton } from '../MoveDownButton';

describe('MoveDownButton', () => {
  it('renders icon', () => {
    const { container } = render(<MoveDownButton />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    const { getByRole } = render(<MoveDownButton onClick={handleClick} />);
    fireEvent.click(getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('has aria-label="Move Down"', () => {
    const { getByRole } = render(<MoveDownButton />);
    expect(getByRole('button')).toHaveAttribute('aria-label', 'Move Down');
  });
});
