/* eslint-disable react/prop-types */
import React from 'react';
import clsx from 'clsx';

export type EnableAllButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const EnableAllButton: React.FC<EnableAllButtonProps> = ({
  className,
  children,
  ...props
}) => (
  <button
    className={clsx(
      'px-4 py-2 rounded-md font-semibold transition-all duration-200',
      'bg-secondary text-secondary-foreground border border-border',
      'hover:bg-accent hover:text-accent-foreground hover:shadow-md',
      'active:bg-accent/90 active:scale-95',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
      className,
    )}
    aria-label="Enable All"
    {...props}
  >
    {children ?? 'Enable All'}
  </button>
);

export default EnableAllButton;
