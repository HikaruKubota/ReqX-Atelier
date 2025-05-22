import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { FiFolder, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import type { SavedFolder } from '../../../types';

interface FolderListItemProps {
  folder: SavedFolder;
  isOpen: boolean;
  depth?: number;
  onToggle: () => void;
  children?: React.ReactNode;
}

export const FolderListItem: React.FC<FolderListItemProps> = ({
  folder,
  isOpen,
  depth = 0,
  onToggle,
  children,
}) => {
  const { setNodeRef } = useDroppable({ id: `folder-${folder.id}` });
  return (
    <div ref={setNodeRef} style={{ marginLeft: depth * 12 }}>
      <div onClick={onToggle} className="flex items-center cursor-pointer select-none py-1">
        {isOpen ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
        <FiFolder className="mx-1" />
        <span>{folder.name}</span>
      </div>
      {isOpen && <div className="ml-4">{children}</div>}
    </div>
  );
};

export default FolderListItem;
