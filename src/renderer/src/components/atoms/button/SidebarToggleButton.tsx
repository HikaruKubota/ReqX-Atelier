import React from 'react';
import { FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import clsx from 'clsx';
import { BaseButton, BaseButtonProps } from './BaseButton';
import { useTranslation } from 'react-i18next';

interface SidebarToggleButtonProps extends BaseButtonProps {
  isOpen: boolean;
}

export const SidebarToggleButton: React.FC<SidebarToggleButtonProps> = ({
  isOpen,
  className,
  ...props
}) => {
  const { t } = useTranslation();
  return (
    <BaseButton
      variant="secondary"
      size="sm"
      className={clsx(
        'flex items-center gap-1 px-2 py-1 rounded-md shadow transition-colors',
        'bg-accent hover:bg-accent',
        className,
      )}
      aria-label={isOpen ? t('hide_sidebar') : t('show_sidebar')}
      {...props}
    >
      {isOpen ? <FiChevronsLeft size={18} /> : <FiChevronsRight size={18} />}
    </BaseButton>
  );
};

export default SidebarToggleButton;
