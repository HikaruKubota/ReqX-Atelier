import React from 'react';
import ReactDOM from 'react-dom/client';
import { FolderTreeDemo } from './components/FolderTree/FolderTreeDemo';
import { PerformanceDemo } from './components/FolderTree/PerformanceDemo';
import './index.css';

// Change to PerformanceDemo to test virtual scrolling
const DEMO_MODE = 'performance'; // 'basic' | 'performance'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {DEMO_MODE === 'performance' ? <PerformanceDemo /> : <FolderTreeDemo />}
  </React.StrictMode>,
);
