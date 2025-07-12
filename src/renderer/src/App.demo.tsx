import React from 'react';
import ReactDOM from 'react-dom/client';
import { FolderTreeDemo } from './components/FolderTree/FolderTreeDemo';
import { PerformanceDemo } from './components/FolderTree/PerformanceDemo';
import { AdapterDemo } from './components/FolderTree/AdapterDemo';
import './index.css';

// Change demo mode to test different features
const DEMO_MODE = 'adapter'; // 'basic' | 'performance' | 'adapter'

const DemoComponent = () => {
  switch (DEMO_MODE) {
    case 'performance':
      return <PerformanceDemo />;
    case 'adapter':
      return <AdapterDemo />;
    default:
      return <FolderTreeDemo />;
  }
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <DemoComponent />
  </React.StrictMode>,
);
