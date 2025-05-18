import { fireEvent, render, screen } from '@testing-library/react';
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
    const btn = screen.getByRole('button');
    expect(btn.textContent).toBe('ダークモード');
    fireEvent.click(btn);
    expect(btn.textContent).toBe('ライトモード');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
