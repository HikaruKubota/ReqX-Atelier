import React, { useRef, useEffect } from 'react';
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
  restrictToParentElement,
  restrictToWindowEdges,
  restrictToHorizontalAxis,
} from '@dnd-kit/modifiers';
import { TabItem } from '../atoms/tab/TabItem';
import { NewRequestIconButton } from '../atoms/button/NewRequestIconButton';
import { useSavedRequestsStore } from '../../store/savedRequestsStore';

export interface TabInfo {
  tabId: string;
  requestId: string | null;
  isDirty: boolean;
}

interface TabListProps {
  tabs: TabInfo[];
  activeTabId: string | null;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onNew: () => void;
  onReorder: (activeId: string, overId: string) => void;
}

export const TabList: React.FC<TabListProps> = ({
  tabs,
  activeTabId,
  onSelect,
  onClose,
  onNew,
  onReorder,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);
  const saved = useSavedRequestsStore((s) => s.savedRequests);

  // クリックとドラッグを明確に分離するセンサ設定
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const modifiers = [restrictToParentElement, restrictToWindowEdges, restrictToHorizontalAxis];

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [activeTabId]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    onReorder(String(active.id), String(over.id));
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd} modifiers={modifiers}>
      <SortableContext items={tabs.map((t) => t.tabId)}>
        <div
          ref={containerRef}
          className="sticky top-0 z-10 bg-background flex items-center border-b overflow-x-auto no-scrollbar flex-none h-11"
        >
          {tabs.map((tab) => {
            const req = saved.find((r) => r.id === tab.requestId);
            return (
              <TabItem
                key={tab.tabId}
                id={tab.tabId}
                ref={activeTabId === tab.tabId ? activeRef : null}
                label={req ? req.name : 'Untitled'}
                method={req ? req.method : 'GET'}
                active={activeTabId === tab.tabId}
                isDirty={tab.isDirty}
                onSelect={() => onSelect(tab.tabId)}
                onClose={() => onClose(tab.tabId)}
              />
            );
          })}
          <NewRequestIconButton onClick={onNew} className="ml-2" />
        </div>
      </SortableContext>
    </DndContext>
  );
};
