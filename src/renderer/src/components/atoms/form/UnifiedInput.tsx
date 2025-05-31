import React from 'react';
import clsx from 'clsx';
import { VariableInput } from '../VariableInput';

export interface UnifiedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  /** Value of the input */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Whether to enable variable support (shows variable hints and warnings) */
  enableVariables?: boolean;
  /** Input type - only text and textarea are supported when enableVariables is true */
  type?: 'text' | 'textarea' | 'email' | 'url' | 'password' | 'number';
  /** Base styling variant */
  variant?: 'default' | 'compact';
  /** Whether to show focus ring */
  showFocusRing?: boolean;
}

export const UnifiedInput: React.FC<UnifiedInputProps> = ({
  value,
  onChange,
  enableVariables = false,
  type = 'text',
  variant = 'default',
  showFocusRing = true,
  className,
  disabled,
  ...rest
}) => {
  // Base styles that are common to all inputs
  const baseStyles = clsx(
    'border rounded transition-colors',
    'bg-white dark:bg-gray-700',
    'text-gray-900 dark:text-gray-100',
    'border-gray-300 dark:border-gray-600',
    'placeholder-gray-400 dark:placeholder-gray-500',
    disabled && 'opacity-50 cursor-not-allowed',
    {
      'p-2': variant === 'default',
      'p-2 text-sm': variant === 'compact',
    }
  );

  const focusStyles = showFocusRing
    ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400'
    : 'focus:outline-none';

  const inputClassName = clsx(baseStyles, focusStyles, className);

  // If variables are enabled and type is text or textarea, use VariableInput
  if (enableVariables && (type === 'text' || type === 'textarea')) {
    return (
      <VariableInput
        value={value}
        onChange={onChange}
        type={type}
        placeholder={rest.placeholder}
        className={inputClassName}
      />
    );
  }

  // For textarea without variables
  if (type === 'textarea') {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={inputClassName}
        {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
      />
    );
  }

  // For all other input types
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={inputClassName}
      {...rest}
    />
  );
};

UnifiedInput.displayName = 'UnifiedInput';

export default UnifiedInput;
