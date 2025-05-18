import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '../../i18n';
import { SidebarToggleButton } from '../SidebarToggleButton';

describe('SidebarToggleButton', () => {
  it('has hide aria-label when open', () => {
    const { getByLabelText, container } = render(
      <SidebarToggleButton isOpen onClick={() => {}} />,
    );
    expect(getByLabelText('サイドバーを隠す')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('has show aria-label when closed', () => {
    const { getByLabelText } = render(
      <SidebarToggleButton isOpen={false} onClick={() => {}} />,
    );
    expect(getByLabelText('サイドバーを表示')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const fn = vi.fn();
    const { getByRole } = render(<SidebarToggleButton isOpen onClick={fn} />);
    fireEvent.click(getByRole('button'));
    expect(fn).toHaveBeenCalled();
  });
});
