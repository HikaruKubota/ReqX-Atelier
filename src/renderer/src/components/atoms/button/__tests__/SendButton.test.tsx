import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { SendButton } from '../SendButton';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        send: 'Send',
        sending: 'Sending...',
      };
      return translations[key] || key;
    },
  }),
}));

describe('SendButton', () => {
  it('should render with "Send" text when not loading', () => {
    render(<SendButton />);

    expect(screen.getByText('Send')).toBeInTheDocument();
  });

  it('should render with "Sending..." text when loading', () => {
    render(<SendButton loading />);

    expect(screen.getByText('Sending...')).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<SendButton onClick={handleClick} />);

    const button = screen.getByText('Send');
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when loading', () => {
    render(<SendButton loading disabled />);

    const button = screen.getByText('Sending...');
    expect(button).toBeDisabled();
  });

  it('should apply custom className', () => {
    render(<SendButton className="custom-class" />);

    const button = screen.getByText('Send');
    expect(button).toHaveClass('custom-class');
  });

  it('should have default styles', () => {
    render(<SendButton />);

    const button = screen.getByText('Send');
    expect(button).toHaveClass('px-4', 'py-2', 'font-semibold', 'rounded', 'shadow-sm');
  });

  it('should use primary variant by default', () => {
    render(<SendButton />);

    const button = screen.getByText('Send');
    // BaseButton adds bg-primary and text-primary-foreground for primary variant
    expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('should accept different variants', () => {
    render(<SendButton variant="secondary" />);

    const button = screen.getByText('Send');
    // BaseButton adds bg-secondary and text-secondary-foreground for secondary variant
    expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground');
  });

  it('should accept different sizes', () => {
    render(<SendButton size="sm" />);

    const button = screen.getByText('Send');
    // BaseButton adds text-xs for small size
    expect(button).toHaveClass('text-xs', 'h-8', 'px-3');
  });

  it('should not be clickable when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<SendButton onClick={handleClick} disabled />);

    const button = screen.getByText('Send');
    await user.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();

    render(<SendButton ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current?.textContent).toBe('Send');
  });
});
