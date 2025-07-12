/* eslint-disable react/prop-types */
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
  isDragging: boolean;
  isDraggedOver: boolean;
  dropPosition: 'before' | 'inside' | 'after' | null;
  onToggle: () => void;
  onSelect: (event?: React.MouseEvent) => void;
  onEndEdit: (newName: string) => void;
  onSingleClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export const TreeNode: React.FC<TreeNodeProps> = React.memo(
  ({
    node,
    level,
    isExpanded,
    isSelected,
    isFocused,
    isEditing,
    isDragging,
    isDraggedOver,
    dropPosition,
    onToggle,
    onSelect,
    onEndEdit,
    onSingleClick,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd,
    onContextMenu,
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
          return (
            <AiFillFolderOpen
              className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-blue-500'}`}
            />
          );
        }
        return <FiFolder className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-blue-500'}`} />;
      }

      if (node.metadata?.method) {
        return (
          <div className={isSelected ? 'brightness-0 invert' : ''}>
            <MethodIcon method={node.metadata.method} />
          </div>
        );
      }

      return <div className="w-4 h-4" />;
    };

    const renderChevron = () => {
      if (node.type !== 'folder') {
        return <div className="w-4 h-4" />;
      }

      return (
        <button
          className={`flex items-center justify-center w-4 h-4 rounded ${
            isSelected ? 'hover:bg-white/20' : 'hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          aria-label={isExpanded ? 'Collapse folder' : 'Expand folder'}
        >
          {isExpanded ? (
            <ChevronDownIcon className={`w-3 h-3 ${isSelected ? 'text-white' : ''}`} />
          ) : (
            <ChevronRightIcon className={`w-3 h-3 ${isSelected ? 'text-white' : ''}`} />
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
        flex items-center h-7 px-1 cursor-pointer select-none overflow-hidden
        ${isSelected ? 'bg-blue-500 text-white dark:bg-blue-600' : ''}
        ${isFocused && !isSelected ? 'bg-gray-200 dark:bg-gray-700' : ''}
        ${isDragging ? 'opacity-50' : ''}
        ${isDraggedOver && dropPosition === 'before' ? 'border-t-2 border-blue-500' : ''}
        ${isDraggedOver && dropPosition === 'inside' ? 'bg-blue-50 dark:bg-blue-900/50' : ''}
        ${isDraggedOver && dropPosition === 'after' ? 'border-b-2 border-blue-500' : ''}
        ${!isSelected && !isFocused ? 'hover:bg-gray-100 dark:hover:bg-gray-800' : ''}
      `}
        onClick={(e) => {
          onSelect(e);
          // Only trigger single click action if this is not a toggle click
          if (e.target !== e.currentTarget.querySelector('button')) {
            onSingleClick();
          }
        }}
        draggable={!isEditing}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
        onContextMenu={onContextMenu}
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
            className="flex-1 min-w-0 max-w-full px-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-blue-500 rounded outline-none"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 truncate text-sm">{node.name}</span>
        )}
      </div>
    );
  },
);

TreeNode.displayName = 'TreeNode';
