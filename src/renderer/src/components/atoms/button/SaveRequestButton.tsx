import React from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { BaseButton, BaseButtonProps } from './BaseButton';

export interface SaveRequestButtonProps extends BaseButtonProps {
  isUpdate?: boolean;
}

export const SaveRequestButton: React.FC<SaveRequestButtonProps> = ({
  isUpdate,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <BaseButton
      variant={variant}
      size={size}
      className={clsx('px-4 py-2 font-semibold rounded shadow-sm', className)}
      {...props}
    >
      {isUpdate ? t('update_request') : t('save_request')}
    </BaseButton>
  );
};

export default SaveRequestButton;
