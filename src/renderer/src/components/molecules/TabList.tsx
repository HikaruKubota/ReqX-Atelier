import React from 'react';
import { TabItem } from '../atoms/tab/TabItem';
import { NewRequestIconButton } from '../atoms/button/NewRequestIconButton';

export interface TabInfo {
  tabId: string;
  name: string;
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
}) => (
  <div className="flex items-center border-b">
    {tabs.map((tab) => (
      <TabItem
        key={tab.tabId}
        label={tab.name}
        active={activeTabId === tab.tabId}
        onSelect={() => onSelect(tab.tabId)}
        onClose={() => onClose(tab.tabId)}
      />
    ))}
    <NewRequestIconButton onClick={onNew} className="ml-2" />
  </div>
);
