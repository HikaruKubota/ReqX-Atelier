import React from 'react';
import clsx from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface BaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const BaseButton: React.FC<BaseButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}) => {
  const variantStyles = {
    primary:
      'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 shadow-sm',
    secondary:
      'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70',
    ghost: 'hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
  };

  const sizeStyles = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 py-2',
    lg: 'h-12 px-8 text-lg',
  };

  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
};

export default BaseButton;
