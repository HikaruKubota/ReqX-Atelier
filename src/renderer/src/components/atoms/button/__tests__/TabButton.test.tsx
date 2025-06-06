import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TabButton } from '../TabButton';

describe('TabButton', () => {
  it('should render with children', () => {
    render(<TabButton>Tab 1</TabButton>);

    expect(screen.getByText('Tab 1')).toBeInTheDocument();
  });

  it('should have active styles when active is true', () => {
    render(<TabButton active>Active Tab</TabButton>);

    const button = screen.getByText('Active Tab');
    expect(button).toHaveClass('font-bold', 'border-primary', 'bg-card');
    expect(button).not.toHaveClass('border-transparent', 'bg-muted');
  });

  it('should have inactive styles when active is false', () => {
    render(<TabButton active={false}>Inactive Tab</TabButton>);

    const button = screen.getByText('Inactive Tab');
    expect(button).toHaveClass('border-transparent', 'bg-muted', 'hover:bg-accent');
    expect(button).not.toHaveClass('font-bold', 'border-primary', 'bg-card');
  });

  it('should have default inactive styles when active is not provided', () => {
    render(<TabButton>Default Tab</TabButton>);

    const button = screen.getByText('Default Tab');
    expect(button).toHaveClass('border-transparent', 'bg-muted', 'hover:bg-accent');
  });

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<TabButton onClick={handleClick}>Clickable Tab</TabButton>);

    const button = screen.getByText('Clickable Tab');
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should have common tab styles', () => {
    render(<TabButton>Tab</TabButton>);

    const button = screen.getByText('Tab');
    expect(button).toHaveClass('rounded-none', 'px-4', 'py-1', 'border-b-2');
  });

  it('should use ghost variant and sm size', () => {
    render(<TabButton>Tab</TabButton>);

    const button = screen.getByText('Tab');
    // BaseButton adds specific classes for ghost variant and sm size
    expect(button).toHaveClass('text-xs', 'h-8', 'px-3');
    // Verify ghost variant styles
    expect(button).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground');
  });

  it('should apply custom className', () => {
    render(<TabButton className="custom-tab-class">Custom Tab</TabButton>);

    const button = screen.getByText('Custom Tab');
    expect(button).toHaveClass('custom-tab-class');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<TabButton disabled>Disabled Tab</TabButton>);

    const button = screen.getByText('Disabled Tab');
    expect(button).toBeDisabled();
  });

  it('should not be clickable when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <TabButton onClick={handleClick} disabled>
        Disabled Tab
      </TabButton>,
    );

    const button = screen.getByText('Disabled Tab');
    await user.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should toggle active state correctly', () => {
    const { rerender } = render(<TabButton active={false}>Toggle Tab</TabButton>);

    const button = screen.getByText('Toggle Tab');
    expect(button).toHaveClass('border-transparent');

    rerender(<TabButton active={true}>Toggle Tab</TabButton>);

    expect(button).toHaveClass('border-primary');
    expect(button).not.toHaveClass('border-transparent');
  });

  it('should forward ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();

    render(<TabButton ref={ref}>Tab with Ref</TabButton>);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current?.textContent).toBe('Tab with Ref');
  });

  it('should maintain custom props', () => {
    render(
      <TabButton data-testid="custom-tab" aria-label="Custom Tab">
        Tab
      </TabButton>,
    );

    const button = screen.getByTestId('custom-tab');
    expect(button).toHaveAttribute('aria-label', 'Custom Tab');
  });
});
