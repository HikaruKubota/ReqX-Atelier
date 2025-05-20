import React, { useEffect, useRef } from 'react';
import { TabItem } from '../atoms/tab/TabItem';
import { NewRequestIconButton } from '../atoms/button/NewRequestIconButton';
import { ScrollableRow } from '../atoms/ScrollableRow';

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
  const tabRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (activeTabId && tabRefs.current[activeTabId]) {
      tabRefs.current[activeTabId]?.scrollIntoView({
        behavior: 'smooth',
        inline: 'nearest',
        block: 'nearest',
      });
    }
  }, [activeTabId]);

  return (
    <ScrollableRow className="flex items-center border-b">
      {tabs.map((tab) => (
        <TabItem
          key={tab.tabId}
          ref={(el) => {
            tabRefs.current[tab.tabId] = el;
          }}
          label={tab.name}
          method={tab.method}
          active={activeTabId === tab.tabId}
          onSelect={() => onSelect(tab.tabId)}
          onClose={() => onClose(tab.tabId)}
        />
      ))}
      <NewRequestIconButton onClick={onNew} className="ml-2 flex-shrink-0" />
    </ScrollableRow>
  );
};
