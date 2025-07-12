import React, { useState, useRef, useEffect } from 'react';
import { TreeNode as TreeNodeType } from '../../types/tree';
import { ChevronRightIcon, ChevronDownIcon } from '@radix-ui/react-icons';
import { FiFolder } from 'react-icons/fi';
import { AiFillFolderOpen } from 'react-icons/ai';
import { MethodIcon } from '../atoms/MethodIcon';

interface TreeNodeProps {
  node: TreeNodeType;
  level: number;
  isExpanded: boolean;
  isSelected: boolean;
  isFocused: boolean;
  isEditing: boolean;
  onToggle: () => void;
  onSelect: () => void;
  onEndEdit: (newName: string) => void;
  onDoubleClick: () => void;
}

export const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  level,
  isExpanded,
  isSelected,
  isFocused,
  isEditing,
  onToggle,
  onSelect,
  onEndEdit,
  onDoubleClick,
}) => {
  const [editValue, setEditValue] = useState(node.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onEndEdit(editValue);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditValue(node.name);
      onEndEdit(node.name);
    }
  };

  const handleBlur = () => {
    onEndEdit(editValue);
  };

  const renderIcon = () => {
    if (node.type === 'folder') {
      if (isExpanded) {
        return <AiFillFolderOpen className="w-4 h-4 text-blue-500" />;
      }
      return <FiFolder className="w-4 h-4 text-blue-500" />;
    }

    if (node.metadata?.method) {
      return <MethodIcon method={node.metadata.method} />;
    }

    return <div className="w-4 h-4" />;
  };

  const renderChevron = () => {
    if (node.type !== 'folder') {
      return <div className="w-4 h-4" />;
    }

    return (
      <button
        className="flex items-center justify-center w-4 h-4 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        aria-label={isExpanded ? 'Collapse folder' : 'Expand folder'}
      >
        {isExpanded ? (
          <ChevronDownIcon className="w-3 h-3" />
        ) : (
          <ChevronRightIcon className="w-3 h-3" />
        )}
      </button>
    );
  };

  return (
    <div
      role="treeitem"
      aria-expanded={node.type === 'folder' ? isExpanded : undefined}
      aria-selected={isSelected}
      aria-level={level + 1}
      tabIndex={isFocused ? 0 : -1}
      className={`
        flex items-center h-7 px-1 cursor-pointer select-none
        ${isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''}
        ${isFocused ? 'outline outline-1 outline-blue-500' : ''}
        hover:bg-gray-100 dark:hover:bg-gray-800
      `}
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
      style={{ paddingLeft: `${level * 20 + 4}px` }}
    >
      {renderChevron()}
      <div className="mx-1">{renderIcon()}</div>

      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="flex-1 px-1 bg-white dark:bg-gray-900 border border-blue-500 rounded outline-none"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="flex-1 truncate text-sm">{node.name}</span>
      )}
    </div>
  );
};
