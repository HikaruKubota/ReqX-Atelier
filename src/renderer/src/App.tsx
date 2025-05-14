// src/App.jsx
import { useEffect, useState } from 'react';
import { health } from './api';

export default function App() {
  const [healthStatus, setHealthStatus] = useState('');

  // マウント時に GET
  useEffect(() => {
    const fetchHealth = async () => {
      const res = await health();
      setHealthStatus(res);
    }
    fetchHealth();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Health: {healthStatus}</h1>
    </div>
  );
}
