import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '../../../../i18n';
import { TrashButton } from '../TrashButton';

describe('TrashButton', () => {
  it('renders FiTrash icon', () => {
    const { container } = render(<TrashButton />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    const { getByRole } = render(<TrashButton onClick={handleClick} />);
    fireEvent.click(getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('has aria-label="削除"', () => {
    const { getByRole } = render(<TrashButton />);
    expect(getByRole('button')).toHaveAttribute('aria-label', '削除');
  });
});
