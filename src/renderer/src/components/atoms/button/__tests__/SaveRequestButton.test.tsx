import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { SaveRequestButton } from '../SaveRequestButton';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        save_request: 'Save Request',
        update_request: 'Update Request',
      };
      return translations[key] || key;
    },
  }),
}));

describe('SaveRequestButton', () => {
  it('should render with "Save Request" text when not updating', () => {
    render(<SaveRequestButton />);

    expect(screen.getByText('Save Request')).toBeInTheDocument();
  });

  it('should render with "Update Request" text when updating', () => {
    render(<SaveRequestButton isUpdate />);

    expect(screen.getByText('Update Request')).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<SaveRequestButton onClick={handleClick} />);

    const button = screen.getByText('Save Request');
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<SaveRequestButton disabled />);

    const button = screen.getByText('Save Request');
    expect(button).toBeDisabled();
  });

  it('should apply custom className', () => {
    render(<SaveRequestButton className="custom-class" />);

    const button = screen.getByText('Save Request');
    expect(button).toHaveClass('custom-class');
  });

  it('should have default styles', () => {
    render(<SaveRequestButton />);

    const button = screen.getByText('Save Request');
    expect(button).toHaveClass('px-4', 'py-2', 'font-semibold', 'rounded-md');
  });

  it('should use primary variant by default', () => {
    render(<SaveRequestButton />);

    const button = screen.getByText('Save Request');
    // BaseButton adds bg-primary and text-primary-foreground for primary variant
    expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('should not be clickable when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<SaveRequestButton onClick={handleClick} disabled />);

    const button = screen.getByText('Save Request');
    await user.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should toggle text when isUpdate prop changes', () => {
    const { rerender } = render(<SaveRequestButton isUpdate={false} />);

    expect(screen.getByText('Save Request')).toBeInTheDocument();

    rerender(<SaveRequestButton isUpdate={true} />);

    expect(screen.getByText('Update Request')).toBeInTheDocument();
  });
});
