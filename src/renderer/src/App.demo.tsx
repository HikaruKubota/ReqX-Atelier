import React from 'react';
import ReactDOM from 'react-dom/client';
import { FolderTreeDemo } from './components/FolderTree/FolderTreeDemo';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <FolderTreeDemo />
  </React.StrictMode>,
);
