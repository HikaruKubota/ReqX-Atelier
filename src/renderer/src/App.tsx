// src/App.jsx
import { useEffect, useState } from 'react';
import { health, sendApiRequest } from './api';

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

export default function App() {
  const [healthStatus, setHealthStatus] = useState('');

  // APIリクエスト用state
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // healthチェックは初回のみ実行
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await health();
        setHealthStatus(res);
      } catch (err) {
        setHealthStatus('Error fetching health');
        console.error(err);
      }
    };
    fetchHealth();
  }, []);

  const handleSendRequest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await sendApiRequest(method, url, (method !== 'GET' && method !== 'HEAD') ? requestBody : undefined);
      if (result.isError) {
        setError(result);
      } else {
        setResponse(result);
      }
    } catch (err: any) {
      setError({ message: err.message, isError: true });
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h1>API Request Sender</h1>
      <p>Health Check: {healthStatus}</p>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <select value={method} onChange={(e) => setMethod(e.target.value)} style={{ padding: '8px' }}>
          {METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter request URL (e.g., http://localhost:3000/todos)"
          style={{ flexGrow: 1, padding: '8px' }}
        />
        <button onClick={handleSendRequest} disabled={loading} style={{ padding: '8px 15px' }}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>

      <div>
        <textarea
          value={requestBody}
          onChange={(e) => setRequestBody(e.target.value)}
          placeholder="Request Body (JSON)"
          rows={8}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          disabled={method === 'GET' || method === 'HEAD'}
        />
      </div>

      <h2>Response</h2>
      {error && (
        <pre style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '10px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          Error: {JSON.stringify(error, null, 2)}
        </pre>
      )}
      {response && (
        <pre style={{ backgroundColor: '#e8f5e9', padding: '10px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
      {!response && !error && !loading && <p>No response yet. Send a request!</p>}
    </div>
  );
}
