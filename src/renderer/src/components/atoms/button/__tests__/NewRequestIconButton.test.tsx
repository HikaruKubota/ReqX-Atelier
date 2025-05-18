import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '../../../../i18n';
import { NewRequestIconButton } from '../NewRequestIconButton';

describe('NewRequestIconButton', () => {
  it('renders plus icon', () => {
    const { container } = render(<NewRequestIconButton />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    const { getByRole } = render(<NewRequestIconButton onClick={handleClick} />);
    fireEvent.click(getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('has aria-label', () => {
    const { getByRole } = render(<NewRequestIconButton />);
    expect(getByRole('button')).toHaveAttribute('aria-label', '新しいリクエスト');
  });
});
