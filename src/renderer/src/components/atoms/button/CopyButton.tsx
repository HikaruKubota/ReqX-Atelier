import React from 'react';
import { FiCopy } from 'react-icons/fi';
import clsx from 'clsx';
import { BaseButton, BaseButtonProps } from './BaseButton';
import { useTranslation } from 'react-i18next';

export const CopyButton: React.FC<BaseButtonProps> = ({
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
      className={clsx(
        'flex items-center gap-1 px-2 py-1 rounded-md transition-colors',
        'hover:bg-gray-200 dark:hover:bg-gray-700',
        className,
      )}
      aria-label={t('copy_response')}
      {...props}
    >
      <FiCopy size={16} />
      <span className="hidden sm:inline">{t('copy_response')}</span>
    </BaseButton>
  );
};

export default CopyButton;
