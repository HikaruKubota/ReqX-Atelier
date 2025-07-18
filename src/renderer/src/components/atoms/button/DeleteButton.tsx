import React from 'react';
import { FiX } from 'react-icons/fi';
import clsx from 'clsx';
import { BaseButton, BaseButtonProps } from './BaseButton';

export const DeleteButton: React.FC<BaseButtonProps> = ({
  size = 'sm',
  variant = 'ghost',
  className,
  ...props
}) => (
  <BaseButton
    variant={variant}
    size={size}
    className={clsx('hover:bg-destructive/10 hover:text-destructive', className)}
    aria-label="Delete"
    {...props}
  >
    <FiX size={18} color="#dc2626" />
  </BaseButton>
);

export default DeleteButton;
