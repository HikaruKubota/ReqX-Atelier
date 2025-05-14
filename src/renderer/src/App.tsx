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

      if (result.isError) { // Network/setup error from main.js or pre-request error in api.ts
        setError(result);
      } else if (result.status && result.status >= 200 && result.status < 300) { // Successful API response (2xx)
        setResponse(result);
      } else { // API error (non-2xx status code)
        setError({
          message: `API Error: Request failed with status code ${result.status || 'unknown'}`,
          status: result.status,
          responseData: result.data, // The actual data from the error response
          headers: result.headers,
          isApiError: true // Custom flag to identify this type of error if needed later
        });
      }
    } catch (err: any) { // Catch errors from sendApiRequest (like JSON parse error in api.ts) or other unexpected issues
      setError({ message: err.message, isError: true, type: 'ApplicationError' });
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
        <div style={{
          border: '2px solid #f44336', // Red border
          backgroundColor: '#ffebee', // Light red background
          padding: '15px',
          margin: '10px 0',
          borderRadius: '4px'
        }}>
          <h3 style={{ color: '#d32f2f', marginTop: 0 }}>Error Details:</h3>
          {error.message && <p style={{ fontWeight: 'bold', color: '#c62828' }}>{error.message}</p>}
          <pre style={{
            backgroundColor: '#fce4ec', // Slightly different background for the pre block
            color: '#ad1457',
            padding: '10px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            marginTop: '10px',
            borderRadius: '4px'
          }}>
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
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
