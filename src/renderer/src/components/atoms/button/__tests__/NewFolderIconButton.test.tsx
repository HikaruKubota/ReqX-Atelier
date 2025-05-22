import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '../../../../i18n';
import { NewFolderIconButton } from '../NewFolderIconButton';

describe('NewFolderIconButton', () => {
  it('renders folder plus icon', () => {
    const { container } = render(<NewFolderIconButton />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    const { getByRole } = render(<NewFolderIconButton onClick={handleClick} />);
    fireEvent.click(getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('has aria-label', () => {
    const { getByRole } = render(<NewFolderIconButton />);
    expect(getByRole('button')).toHaveAttribute('aria-label', '新しいフォルダ');
  });
});
