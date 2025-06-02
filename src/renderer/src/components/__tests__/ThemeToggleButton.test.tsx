import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { ThemeToggleButton } from '../ThemeToggleButton';
import '../../i18n';

describe('ThemeToggleButton', () => {
  it('toggles theme and shows translated text', () => {
    render(
      <ThemeProvider>
        <ThemeToggleButton />
      </ThemeProvider>,
    );
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    
    // Check that the light theme option is present
    expect(screen.getByText('ライト')).toBeInTheDocument();
    expect(screen.getByText('ダーク')).toBeInTheDocument();
    expect(screen.getByText('セピア')).toBeInTheDocument();
    
    // Change to dark theme
    fireEvent.change(select, { target: { value: 'dark' } });
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
