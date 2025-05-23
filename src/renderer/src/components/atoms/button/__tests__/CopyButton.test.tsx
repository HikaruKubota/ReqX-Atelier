import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '../../../../i18n';
import { CopyButton } from '../CopyButton';

describe('CopyButton', () => {
  it('renders copy icon and label', () => {
    const { getByText, container } = render(<CopyButton />);
    expect(getByText('レスポンスをコピー')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders custom label when labelKey provided', () => {
    const { getByText } = render(<CopyButton labelKey="copy_error" />);
    expect(getByText('エラーをコピー')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    const { getByRole } = render(<CopyButton onClick={handleClick} />);
    fireEvent.click(getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('has aria-label', () => {
    const { getByRole } = render(<CopyButton />);
    expect(getByRole('button')).toHaveAttribute('aria-label', 'レスポンスをコピー');
  });

  it('aria-label changes with labelKey', () => {
    const { getByRole } = render(<CopyButton labelKey="copy_error" />);
    expect(getByRole('button')).toHaveAttribute('aria-label', 'エラーをコピー');
  });
});
