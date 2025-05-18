import React from 'react';
import { FiPlus } from 'react-icons/fi';
import clsx from 'clsx';
import { BaseButton, BaseButtonProps } from './BaseButton';
import { useTranslation } from 'react-i18next';

export const NewRequestIconButton: React.FC<BaseButtonProps> = ({
  size = 'sm',
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
        'p-2 rounded-md shadow-sm transition-colors',
        'bg-blue-500 text-white hover:bg-blue-600',
        className,
      )}
      aria-label={t('new_request')}
      {...props}
    >
      <FiPlus size={18} />
    </BaseButton>
  );
};

export default NewRequestIconButton;
