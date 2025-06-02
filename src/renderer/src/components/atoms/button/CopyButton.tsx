import React from 'react';
import { FiCopy } from 'react-icons/fi';
import clsx from 'clsx';
import { BaseButton, BaseButtonProps } from './BaseButton';
import { useTranslation } from 'react-i18next';

export interface CopyButtonProps extends BaseButtonProps {
  labelKey?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  size = 'sm',
  variant = 'ghost',
  className,
  labelKey = 'copy_response',
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <BaseButton
      size={size}
      variant={variant}
      className={clsx(
        'flex items-center gap-1 px-2 py-1 rounded-md transition-colors',
        'hover:bg-accent',
        className,
      )}
      aria-label={t(labelKey)}
      {...props}
    >
      <FiCopy size={16} />
      <span className="hidden sm:inline">{t(labelKey)}</span>
    </BaseButton>
  );
};

export default CopyButton;
