import React, { useState } from 'react';
import clsx from 'clsx';
import type { SavedRequest } from '../../../types';
import { DeleteButton } from '../button/DeleteButton';
import { MethodIcon } from '../MethodIcon';
import { ContextMenu } from '../menu/ContextMenu';
import { useTranslation } from 'react-i18next';

interface RequestListItemProps {
  request: SavedRequest;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export const RequestListItem: React.FC<RequestListItemProps> = ({
  request,
  isActive,
  onClick,
  onDelete,
}) => {
  const { t } = useTranslation();
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);

  return (
    <div
      onClick={onClick}
      onContextMenu={(e) => {
        e.preventDefault();
        setMenuPos({ x: e.clientX, y: e.clientY });
      }}
      className={clsx(
        'px-3 py-2 my-1 cursor-pointer border rounded flex justify-between items-center transition-colors',
        isActive
          ? 'font-bold border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
          : 'bg-white font-normal border-gray-200 hover:bg-gray-100 dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-gray-200',
      )}
    >
      <div className="flex items-center gap-2">
        <MethodIcon method={request.method} />
        <span>{request.name}</span>
      </div>
      <DeleteButton
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        X
      </DeleteButton>
      {menuPos && (
        <ContextMenu
          title={request.name}
          position={menuPos}
          onClose={() => setMenuPos(null)}
          items={[
            { key: '1', label: t('context_menu_item1'), onClick: () => {} },
            { key: '2', label: t('context_menu_item2'), onClick: () => {} },
            { key: '3', label: t('context_menu_item3'), onClick: () => {} },
          ]}
        />
      )}
    </div>
  );
};
