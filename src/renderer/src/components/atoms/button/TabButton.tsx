import React from 'react';
import clsx from 'clsx';
import { BaseButton, BaseButtonProps } from './BaseButton';

interface TabButtonProps extends BaseButtonProps {
  active?: boolean;
}

export const TabButton: React.FC<TabButtonProps> = ({ active, className, ...props }) => (
  <BaseButton
    size="sm"
    variant={active ? 'primary' : 'secondary'}
    className={clsx('rounded-none px-4 py-1', className)}
    {...props}
  />
);

export default TabButton;
