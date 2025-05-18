import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AddFolderButton } from '../AddFolderButton';

describe('AddFolderButton', () => {
  it('renders icon and label', () => {
    const { getByText, container } = render(<AddFolderButton />);
    expect(getByText('Add Folder')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    const { getByRole } = render(<AddFolderButton onClick={handleClick} />);
    fireEvent.click(getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
