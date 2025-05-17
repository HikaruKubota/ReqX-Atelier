import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DeleteButton } from '../DeleteButton';

describe('DeleteButton', () => {
  it('renders children', () => {
    const { getByText } = render(<DeleteButton>X</DeleteButton>);
    expect(getByText('X')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    const { getByRole } = render(<DeleteButton onClick={handleClick}>X</DeleteButton>);
    fireEvent.click(getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('has aria-label="Delete"', () => {
    const { getByRole } = render(<DeleteButton>X</DeleteButton>);
    expect(getByRole('button')).toHaveAttribute('aria-label', 'Delete');
  });
});
