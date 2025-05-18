import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DetailsButton } from '../DetailsButton';
import '../../../i18n';

describe('DetailsButton', () => {
  it('renders icon', () => {
    const { container } = render(<DetailsButton />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    const { getByRole } = render(<DetailsButton onClick={handleClick} />);
    fireEvent.click(getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('has aria-label', () => {
    const { getByRole } = render(<DetailsButton />);
    expect(getByRole('button')).toHaveAttribute('aria-label', 'Details');
  });
});
