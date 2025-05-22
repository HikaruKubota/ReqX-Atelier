import React from 'react';
import { FiFolderPlus } from 'react-icons/fi';
import clsx from 'clsx';
import { BaseButton, BaseButtonProps } from './BaseButton';
import { useTranslation } from 'react-i18next';

export const NewFolderButton: React.FC<BaseButtonProps> = ({
  size = 'md',
  variant = 'primary',
  className,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <BaseButton
      size={size}
      variant={variant}
      className={clsx(
        'flex items-center gap-2 px-4 py-2 rounded-md font-semibold shadow-sm transition-colors',
        'bg-blue-500 text-white hover:bg-blue-600',
        className,
      )}
      aria-label={t('new_folder')}
      {...props}
    >
      <FiFolderPlus size={18} />
      <span>{t('new_folder')}</span>
    </BaseButton>
  );
};
