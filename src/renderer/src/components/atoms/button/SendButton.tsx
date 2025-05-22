import React from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { BaseButton, BaseButtonProps } from './BaseButton';

export interface SendButtonProps extends BaseButtonProps {
  loading?: boolean;
}

export const SendButton: React.FC<SendButtonProps> = ({
  loading,
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
      {loading ? t('sending') : t('send')}
    </BaseButton>
  );
};

export default SendButton;
