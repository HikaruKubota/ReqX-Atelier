import React, { useState } from 'react';
import { FiFolder, FiChevronRight, FiChevronDown } from 'react-icons/fi';
import type { SavedFolder, SavedRequest } from '../../../types';
import { RequestListItem } from './RequestListItem';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface FolderListItemProps {
  folder: SavedFolder;
  folders: SavedFolder[];
  requests: SavedRequest[];
  activeRequestId: string | null;
  onLoadRequest: (req: SavedRequest) => void;
  onContextMenu: (folderId: string, x: number, y: number) => void;
  dragId?: string;
}

export const FolderListItem: React.FC<FolderListItemProps> = ({
  folder,
  folders,
  requests,
  activeRequestId,
  onLoadRequest,
  onContextMenu,
  dragId,
}) => {
  const [open, setOpen] = useState(true);
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: dragId || `folder-${folder.id}`,
  });
  const { setNodeRef: dropRef } = useDroppable({ id: `folder-drop-${folder.id}` });
  const style = { transform: CSS.Translate.toString(transform) };

  const subFolders = folders
    .filter((f) => f.parentFolderId === folder.id)
    .sort((a, b) => a.name.localeCompare(b.name));
  const subRequests = requests
    .filter((r) => folder.requestIds.includes(r.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="ml-2" ref={dropRef}>
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-center gap-1 cursor-pointer select-none"
        onClick={() => setOpen(!open)}
        onContextMenu={(e) => {
          e.preventDefault();
          onContextMenu(folder.id, e.clientX, e.clientY);
        }}
        {...listeners}
        {...attributes}
      >
        {open ? <FiChevronDown size={12} /> : <FiChevronRight size={12} />}
        <FiFolder className="text-yellow-600" />
        <span>{folder.name}</span>
      </div>
      {open && (
        <div className="ml-4">
          {subFolders.map((sub) => (
            <FolderListItem
              key={sub.id}
              folder={sub}
              folders={folders}
              requests={requests}
              activeRequestId={activeRequestId}
              onLoadRequest={onLoadRequest}
              onContextMenu={onContextMenu}
              dragId={`folder-${sub.id}`}
            />
          ))}
          {subRequests.map((req) => (
            <RequestListItem
              key={req.id}
              request={req}
              isActive={activeRequestId === req.id}
              onClick={() => onLoadRequest(req)}
              draggableId={`request-${req.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FolderListItem;
