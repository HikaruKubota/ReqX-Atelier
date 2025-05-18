import React from 'react';
import { FiTrash } from 'react-icons/fi';
import clsx from 'clsx';
import { BaseButton, BaseButtonProps } from './BaseButton';
import { useTranslation } from 'react-i18next';

export const TrashButton: React.FC<BaseButtonProps> = ({
  className,
  size = 'sm',
  variant = 'ghost',
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <BaseButton
      size={size}
      variant={variant}
      className={clsx('p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-800 rounded', className)}
      aria-label={t('remove')}
      {...props}
    >
      <FiTrash size={16} />
    </BaseButton>
  );
};

export default TrashButton;
