import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DisableAllButton } from '../DisableAllButton';

describe('DisableAllButton', () => {
  it('renders label', () => {
    const { getByText } = render(<DisableAllButton />);
    expect(getByText('Disable All')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    const { getByRole } = render(<DisableAllButton onClick={handleClick} />);
    fireEvent.click(getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('has aria-label="Disable All"', () => {
    const { getByRole } = render(<DisableAllButton />);
    expect(getByRole('button')).toHaveAttribute('aria-label', 'Disable All');
  });
});
