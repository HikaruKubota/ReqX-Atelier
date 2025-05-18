import React from 'react';
import { useTranslation } from 'react-i18next';

interface RequestActionMenuProps {
  onMove: () => void;
  onDelete: () => void;
}

export const RequestActionMenu: React.FC<RequestActionMenuProps> = ({ onMove, onDelete }) => {
  const { t } = useTranslation();
  return (
    <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-700 border rounded shadow">
      <button
        className="block w-full text-left px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-600"
        onClick={onMove}
      >
        {t('move_to_folder')}
      </button>
      <button
        className="block w-full text-left px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-600"
        onClick={onDelete}
      >
        {t('delete')}
      </button>
    </div>
  );
};

export default RequestActionMenu;
