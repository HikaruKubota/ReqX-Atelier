import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '../../../../i18n';
import { NewRequestButton } from '../NewRequestButton';

describe('NewRequestButton', () => {
  it('renders plus icon and label', () => {
    const { getByText, container } = render(<NewRequestButton />);
    expect(getByText('新しいリクエスト')).toBeInTheDocument();
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
    expect(getByRole('button')).toHaveAttribute('aria-label', '新しいリクエスト');
  });
});
