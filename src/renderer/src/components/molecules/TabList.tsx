import React from 'react';
import { TabItem } from '../atoms/tab/TabItem';

export interface TabInfo {
  tabId: string;
  name: string;
}

interface TabListProps {
  tabs: TabInfo[];
  activeTabId: string | null;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
}

export const TabList: React.FC<TabListProps> = ({ tabs, activeTabId, onSelect, onClose }) => (
  <div className="flex border-b">
    {tabs.map((tab) => (
      <TabItem
        key={tab.tabId}
        label={tab.name}
        active={activeTabId === tab.tabId}
        onSelect={() => onSelect(tab.tabId)}
        onClose={() => onClose(tab.tabId)}
      />
    ))}
  </div>
);
