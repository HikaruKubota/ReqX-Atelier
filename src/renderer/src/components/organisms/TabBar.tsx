import React from 'react';
import { TabList, TabInfo } from '../molecules/TabList';

interface TabBarProps {
  tabs: TabInfo[];
  activeTabId: string | null;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onNew: () => void;
}

export const TabBar: React.FC<TabBarProps> = ({ tabs, activeTabId, onSelect, onClose, onNew }) => (
  <TabList
    tabs={tabs}
    activeTabId={activeTabId}
    onSelect={onSelect}
    onClose={onClose}
    onNew={onNew}
  />
);
