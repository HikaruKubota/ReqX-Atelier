import React from 'react';
import clsx from 'clsx';
import { BaseButton, BaseButtonProps } from './BaseButton';

interface TabButtonProps extends BaseButtonProps {
  active?: boolean;
}

export const TabButton: React.FC<TabButtonProps> = ({ active, className, ...props }) => (
  <BaseButton
    size="sm"
    variant="ghost"
    className={clsx(
      'rounded-none px-4 py-1 border-b-2',
      active ? 'font-bold border-primary bg-card' : 'border-transparent bg-muted hover:bg-accent',
      className,
    )}
    {...props}
  />
);

export default TabButton;
