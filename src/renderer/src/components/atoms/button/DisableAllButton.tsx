/* eslint-disable react/prop-types */
import React from 'react';
import clsx from 'clsx';

export type DisableAllButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const DisableAllButton: React.FC<DisableAllButtonProps> = ({
  className,
  children,
  ...props
}) => (
  <button
    className={clsx(
      'px-4 py-2 rounded-md font-semibold transition-all duration-200',
      'bg-destructive text-destructive-foreground',
      'hover:bg-destructive/90 hover:shadow-md',
      'active:bg-destructive/80 active:scale-95',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2',
      className,
    )}
    aria-label="Disable All"
    {...props}
  >
    {children ?? 'Disable All'}
  </button>
);

export default DisableAllButton;
