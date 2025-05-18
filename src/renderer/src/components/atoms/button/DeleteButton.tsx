import React from 'react';
import { FiX } from 'react-icons/fi';
import clsx from 'clsx';
import { BaseButton, BaseButtonProps } from './BaseButton.tsx';

export const DeleteButton: React.FC<BaseButtonProps> = ({
  size = 'sm',
  variant = 'ghost',
  className,
  ...props
}) => (
  <BaseButton
    variant={variant}
    size={size}
    className={clsx('hover:bg-red-100 hover:text-red-600', className)}
    aria-label="Delete"
    {...props}
  >
    <FiX size={18} color="#dc2626" />
  </BaseButton>
);
