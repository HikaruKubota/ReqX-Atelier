import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BaseButton } from '../BaseButton';

describe('BaseButton', () => {
  it('fires onClick', () => {
    const fn = vi.fn();
    render(<BaseButton onClick={fn}>Save</BaseButton>);
    fireEvent.click(screen.getByText('Save'));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('applies variant & size classes', () => {
    render(<BaseButton variant="secondary" size="lg">OK</BaseButton>);
    const btn = screen.getByText('OK');
    expect(btn).toHaveClass('btn-secondary', 'btn-lg');
  });
});
