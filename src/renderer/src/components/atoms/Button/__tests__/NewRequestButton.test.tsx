import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NewRequestButton } from '../NewRequestButton';

describe('NewRequestButton', () => {
  it('renders plus icon and label', () => {
    const { getByText, container } = render(<NewRequestButton />);
    expect(getByText('New Request')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    const { getByRole } = render(<NewRequestButton onClick={handleClick} />);
    fireEvent.click(getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('has aria-label="New Request"', () => {
    const { getByRole } = render(<NewRequestButton />);
    expect(getByRole('button')).toHaveAttribute('aria-label', 'New Request');
  });
});
