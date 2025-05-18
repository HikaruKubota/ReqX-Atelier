import React from 'react';
import { FiMoreHorizontal } from 'react-icons/fi';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { BaseButton, BaseButtonProps } from './BaseButton';

export const DetailsButton: React.FC<BaseButtonProps> = ({
  size = 'sm',
  variant = 'ghost',
  className,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <BaseButton
      size={size}
      variant={variant}
      className={clsx('hover:bg-gray-200 dark:hover:bg-gray-700', className)}
      aria-label={t('details')}
      {...props}
    >
      <FiMoreHorizontal size={16} />
    </BaseButton>
  );
};

export default DetailsButton;
