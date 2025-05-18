import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EnableAllButton } from '../EnableAllButton';

describe('EnableAllButton', () => {
  it('renders label', () => {
    const { getByText } = render(<EnableAllButton />);
    expect(getByText('Enable All')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    const { getByRole } = render(<EnableAllButton onClick={handleClick} />);
    fireEvent.click(getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('has aria-label="Enable All"', () => {
    const { getByRole } = render(<EnableAllButton />);
    expect(getByRole('button')).toHaveAttribute('aria-label', 'Enable All');
  });
});
