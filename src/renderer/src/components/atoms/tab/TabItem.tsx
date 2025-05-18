import React from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

interface TabItemProps {
  label: string;
  active: boolean;
  onSelect: () => void;
  onClose: () => void;
}

export const TabItem: React.FC<TabItemProps> = ({ label, active, onSelect, onClose }) => {
  const { t } = useTranslation();
  return (
    <div
      className={clsx(
        'px-3 py-1 flex items-center space-x-2 cursor-pointer border-b',
        active
          ? 'font-bold border-blue-500 bg-white dark:bg-gray-700'
          : 'border-transparent bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700',
      )}
      onClick={onSelect}
    >
      <span>{label}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label={t('close_tab')}
      >
        ×
      </button>
    </div>
  );
};
