import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NewFolderButton } from '../NewFolderButton';

describe('NewFolderButton', () => {
  it('calls onClick', () => {
    const fn = vi.fn();
    const { getByRole } = render(<NewFolderButton onClick={fn} />);
    fireEvent.click(getByRole('button'));
    expect(fn).toHaveBeenCalled();
  });
});
