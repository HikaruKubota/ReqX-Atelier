import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DeleteButton } from '../DeleteButton';

describe('DeleteButton', () => {
  it('renders FiX icon', () => {
    const { container } = render(<DeleteButton />);
    // SVGアイコンが存在するか確認
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    const { getByRole } = render(<DeleteButton onClick={handleClick} />);
    fireEvent.click(getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('has aria-label="Delete"', () => {
    const { getByRole } = render(<DeleteButton />);
    expect(getByRole('button')).toHaveAttribute('aria-label', 'Delete');
  });
});
