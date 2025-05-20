import React from 'react';
import { FiMove } from 'react-icons/fi';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { BaseButton, BaseButtonProps } from './BaseButton';

export const DragHandleButton: React.FC<BaseButtonProps> = ({ className, ...props }) => {
  const { t } = useTranslation();
  return (
    <BaseButton
      variant="secondary"
      size="sm"
      className={clsx(
        'p-1 rounded-md cursor-grab active:cursor-grabbing transition-colors',
        'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600',
        className,
      )}
      aria-label={t('drag_handle')}
      {...props}
    >
      <FiMove size={16} />
    </BaseButton>
  );
};

export default DragHandleButton;
