import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '../../i18n';
import { SidebarToggleButton } from '../SidebarToggleButton';

describe('SidebarToggleButton', () => {
  it('shows hide label when open', () => {
    const { getByRole } = render(<SidebarToggleButton isOpen onClick={() => {}} />);
    expect(getByRole('button').textContent).toBe('サイドバーを隠す');
  });

  it('shows show label when closed', () => {
    const { getByRole } = render(<SidebarToggleButton isOpen={false} onClick={() => {}} />);
    expect(getByRole('button').textContent).toBe('サイドバーを表示');
  });

  it('calls onClick when clicked', () => {
    const fn = vi.fn();
    const { getByRole } = render(<SidebarToggleButton isOpen onClick={fn} />);
    fireEvent.click(getByRole('button'));
    expect(fn).toHaveBeenCalled();
  });
});
