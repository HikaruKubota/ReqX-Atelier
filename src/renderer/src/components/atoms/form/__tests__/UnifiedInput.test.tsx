import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UnifiedInput } from '../UnifiedInput';

// Mock VariableInput since it has complex dependencies
interface MockVariableInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  type?: 'text' | 'textarea';
}

vi.mock('../../VariableInput', () => ({
  VariableInput: ({ value, onChange, placeholder, className, type }: MockVariableInputProps) => {
    const Component = type === 'textarea' ? 'textarea' : 'input';
    return (
      <Component
        data-testid="variable-input"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className={className}
      />
    );
  },
}));

describe('UnifiedInput', () => {
  it('renders a basic text input', () => {
    const onChange = vi.fn();
    render(<UnifiedInput value="test value" onChange={onChange} placeholder="Enter text" />);

    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('test value');
  });

  it('calls onChange when value changes', () => {
    const onChange = vi.fn();
    render(<UnifiedInput value="" onChange={onChange} placeholder="Enter text" />);

    const input = screen.getByPlaceholderText('Enter text');
    fireEvent.change(input, { target: { value: 'new value' } });
    expect(onChange).toHaveBeenCalledWith('new value');
  });

  it('renders VariableInput when enableVariables is true', () => {
    const onChange = vi.fn();
    render(
      <UnifiedInput
        value="test ${var}"
        onChange={onChange}
        enableVariables={true}
        placeholder="Variable input"
      />,
    );

    const input = screen.getByTestId('variable-input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('test ${var}');
  });

  it('renders textarea when type is textarea', () => {
    const onChange = vi.fn();
    render(
      <UnifiedInput
        value="multiline text"
        onChange={onChange}
        type="textarea"
        placeholder="Enter description"
      />,
    );

    const textarea = screen.getByPlaceholderText('Enter description');
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).toHaveValue('multiline text');
  });

  it('applies disabled state correctly', () => {
    render(
      <UnifiedInput
        value="disabled input"
        onChange={vi.fn()}
        disabled={true}
        placeholder="Disabled"
      />,
    );

    const input = screen.getByPlaceholderText('Disabled');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('applies variant styles correctly', () => {
    const { rerender } = render(
      <UnifiedInput value="" onChange={vi.fn()} variant="default" placeholder="Default variant" />,
    );

    let input = screen.getByPlaceholderText('Default variant');
    expect(input).toHaveClass('p-2');

    rerender(
      <UnifiedInput value="" onChange={vi.fn()} variant="compact" placeholder="Compact variant" />,
    );

    input = screen.getByPlaceholderText('Compact variant');
    expect(input).toHaveClass('p-2', 'text-sm');
  });

  it('supports different input types', () => {
    const { rerender } = render(
      <UnifiedInput value="test@email.com" onChange={vi.fn()} type="email" placeholder="Email" />,
    );

    let input = screen.getByPlaceholderText('Email') as HTMLInputElement;
    expect(input.type).toBe('email');

    rerender(<UnifiedInput value="123" onChange={vi.fn()} type="number" placeholder="Number" />);

    input = screen.getByPlaceholderText('Number') as HTMLInputElement;
    expect(input.type).toBe('number');
  });

  it('applies custom className', () => {
    render(
      <UnifiedInput
        value=""
        onChange={vi.fn()}
        className="custom-class w-full"
        placeholder="Custom styled"
      />,
    );

    const input = screen.getByPlaceholderText('Custom styled');
    expect(input).toHaveClass('custom-class', 'w-full');
  });

  it('does not show focus ring when showFocusRing is false', () => {
    render(
      <UnifiedInput
        value=""
        onChange={vi.fn()}
        showFocusRing={false}
        placeholder="No focus ring"
      />,
    );

    const input = screen.getByPlaceholderText('No focus ring');
    expect(input).toHaveClass('focus:outline-none');
    expect(input).not.toHaveClass('focus:ring-2');
  });
});
