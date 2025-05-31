import React from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MethodIcon } from '../MethodIcon';

interface TabItemProps {
  id: string;
  label: string;
  method: string;
  active: boolean;
  isDirty: boolean;
  onSelect: () => void;
  onClose: () => void;
}

export const TabItem = React.forwardRef<HTMLDivElement, TabItemProps>(
  ({ id, label, method, active, isDirty, onSelect, onClose }, ref) => {
    const { t } = useTranslation();
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id,
    });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.6 : 1,
    };

    const combinedRef = (node: HTMLDivElement | null) => {
      setNodeRef(node);
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    };

    return (
      <div
        ref={combinedRef}
        style={style}
        className={clsx(
          'px-3 py-1 flex items-center space-x-2 cursor-pointer border-b w-40',
          active
            ? 'font-bold border-blue-500 bg-white dark:bg-gray-700'
            : 'border-transparent bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700',
        )}
        onClick={() => {
          if (isDragging) return;
          onSelect();
        }}
        {...listeners}
        {...attributes}
      >
        <MethodIcon method={method} size={16} />
        <span className="flex-1 truncate">
          {label}
          {isDirty && '*'}
        </span>
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
  },
);
TabItem.displayName = 'TabItem';
