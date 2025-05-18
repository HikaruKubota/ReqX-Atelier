import React from 'react';
import { TabList, TabInfo } from '../molecules/TabList';

interface TabBarProps {
  tabs: TabInfo[];
  activeTabId: string | null;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ tabs, activeTabId, onSelect, onClose }) => (
  <TabList tabs={tabs} activeTabId={activeTabId} onSelect={onSelect} onClose={onClose} />
);
