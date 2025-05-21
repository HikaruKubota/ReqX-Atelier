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
      active
        ? 'font-bold border-blue-500 bg-white dark:bg-gray-700'
        : 'border-transparent bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700',
      className,
    )}
    {...props}
  />
);

export default TabButton;
