import React from 'react';
import { FiFolderPlus } from 'react-icons/fi';
import clsx from 'clsx';
import { BaseButton, BaseButtonProps } from './BaseButton';
import { useTranslation } from 'react-i18next';

export const NewFolderButton: React.FC<BaseButtonProps> = ({
  size = 'sm',
  variant = 'secondary',
  className,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <BaseButton
      size={size}
      variant={variant}
      className={clsx(
        'flex items-center gap-1 px-2 py-1 rounded-md shadow transition-colors',
        'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600',
        className,
      )}
      aria-label={t('new_folder')}
      {...props}
    >
      <FiFolderPlus size={16} />
      <span>{t('new_folder')}</span>
    </BaseButton>
  );
};

export default NewFolderButton;
