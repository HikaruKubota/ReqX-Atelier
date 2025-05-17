import React from 'react';
import { BaseButton, BaseButtonProps } from './BaseButton';
import clsx from 'clsx';

export const DeleteButton: React.FC<BaseButtonProps> = ({
  size = 'sm',
  variant = 'ghost',
  className,
  ...props
}) => (
  <BaseButton
    variant={variant}
    size={size}
    className={clsx(
      'text-red-500 hover:bg-red-100 hover:text-red-600',
      className
    )}
    aria-label="Delete"
    {...props}
  >
    X
  </BaseButton>
);
