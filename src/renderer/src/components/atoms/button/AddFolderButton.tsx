import React from 'react';
import { FiFolderPlus } from 'react-icons/fi';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { BaseButton, BaseButtonProps } from './BaseButton';

export const AddFolderButton: React.FC<BaseButtonProps> = ({
  size = 'md',
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
        'flex items-center gap-2 px-4 py-2 rounded-md font-semibold shadow-sm transition-colors',
        'bg-green-500 text-white hover:bg-green-600',
        className,
      )}
      aria-label={t('add_folder')}
      {...props}
    >
      <FiFolderPlus size={18} />
      <span>{t('add_folder')}</span>
    </BaseButton>
  );
};
