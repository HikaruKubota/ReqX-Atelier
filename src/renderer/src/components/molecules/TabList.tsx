import React, { useRef, useEffect } from 'react';
import { TabItem } from '../atoms/tab/TabItem';
import { NewRequestIconButton } from '../atoms/button/NewRequestIconButton';

export interface TabInfo {
  tabId: string;
  name: string;
  method: string;
}

interface TabListProps {
  tabs: TabInfo[];
  activeTabId: string | null;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onNew: () => void;
}

export const TabList: React.FC<TabListProps> = ({
  tabs,
  activeTabId,
  onSelect,
  onClose,
  onNew,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [activeTabId]);

  return (
    <div
      ref={containerRef}
      className="sticky top-0 z-10 bg-background flex items-center border-t border-b overflow-x-auto no-scrollbar px-2 py-1 mt-1"
    >
      {tabs.map((tab) => (
        <TabItem
          key={tab.tabId}
          ref={activeTabId === tab.tabId ? activeRef : null}
          label={tab.name}
          method={tab.method}
          active={activeTabId === tab.tabId}
          onSelect={() => onSelect(tab.tabId)}
          onClose={() => onClose(tab.tabId)}
        />
      ))}
      <NewRequestIconButton onClick={onNew} className="ml-2" />
    </div>
  );
};
