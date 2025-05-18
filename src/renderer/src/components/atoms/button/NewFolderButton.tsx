import React from 'react';
import { FiFolderPlus } from 'react-icons/fi';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { BaseButton, BaseButtonProps } from './BaseButton';

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
      className={clsx('flex items-center gap-1', className)}
      aria-label={t('new_folder')}
      {...props}
    >
      <FiFolderPlus size={16} />
      <span>{t('new_folder')}</span>
    </BaseButton>
  );
};
