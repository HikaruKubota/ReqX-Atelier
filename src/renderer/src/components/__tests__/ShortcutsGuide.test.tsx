import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ShortcutsGuide } from '../organisms/ShortcutsGuide';
import '../../i18n';

describe('ShortcutsGuide', () => {
  it('renders guide text and button', () => {
    const { getByText, getByRole } = render(<ShortcutsGuide onNew={() => {}} />);
    expect(getByText('ショートカット一覧')).toBeInTheDocument();
    expect(getByRole('button')).toBeInTheDocument();
  });

  it('calls onNew when button clicked', () => {
    const handler = vi.fn();
    const { getByRole } = render(<ShortcutsGuide onNew={handler} />);
    fireEvent.click(getByRole('button'));
    expect(handler).toHaveBeenCalled();
  });
});
