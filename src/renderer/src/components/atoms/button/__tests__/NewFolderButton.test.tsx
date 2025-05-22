import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '../../../../i18n';
import { NewFolderButton } from '../NewFolderButton';

describe('NewFolderButton', () => {
  it('renders icon and label', () => {
    const { getByText, container } = render(<NewFolderButton />);
    expect(getByText('新しいフォルダー')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const fn = vi.fn();
    const { getByRole } = render(<NewFolderButton onClick={fn} />);
    fireEvent.click(getByRole('button'));
    expect(fn).toHaveBeenCalled();
  });

  it('has aria-label', () => {
    const { getByRole } = render(<NewFolderButton />);
    expect(getByRole('button')).toHaveAttribute('aria-label', '新しいフォルダー');
  });
});
