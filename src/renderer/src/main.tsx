import { createRoot } from 'react-dom/client';
import App from './App';

import './index.css'
import './i18n';

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(<App />);
}
