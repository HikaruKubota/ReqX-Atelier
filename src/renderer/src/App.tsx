// src/App.jsx
import { useEffect, useState } from 'react';
import { health, sendApiRequest } from './api';

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

interface SavedRequest {
  id: string;
  name: string;
  method: string;
  url: string;
  body?: string;
}

export default function App() {
  const [healthStatus, setHealthStatus] = useState('');

  // Current request form state
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [requestBody, setRequestBody] = useState('');
  const [requestNameForSave, setRequestNameForSave] = useState(''); // New state for the request name

  // Response/Error state
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Saved requests state
  const [savedRequests, setSavedRequests] = useState<SavedRequest[]>([]);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

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
    // Load saved requests from localStorage on initial load
    try {
      const loadedRequests = localStorage.getItem('savedApiRequests');
      if (loadedRequests) {
        setSavedRequests(JSON.parse(loadedRequests));
      }
    } catch (e) {
      console.error('Failed to load saved requests from localStorage:', e);
      setSavedRequests([]); // Initialize with empty array on error
      localStorage.removeItem('savedApiRequests'); // Optionally clear corrupted data
    }
  }, []);

  // Persist saved requests to localStorage whenever they change (optional persistence)
  useEffect(() => {
    localStorage.setItem('savedApiRequests', JSON.stringify(savedRequests));
  }, [savedRequests]);

  const clearForm = (clearActiveId = true) => {
    setMethod('GET');
    setUrl('');
    setRequestBody('');
    setRequestNameForSave(''); // Clear request name as well
    setResponse(null);
    setError(null);
    if (clearActiveId) {
      setActiveRequestId(null);
    }
  };

  const handleNewRequest = () => {
    clearForm();
  };

  const handleLoadRequest = (req: SavedRequest) => {
    setMethod(req.method);
    setUrl(req.url);
    setRequestBody(req.body || '');
    setRequestNameForSave(req.name); // Load name into the input field
    setActiveRequestId(req.id);
    setResponse(null); // Clear previous response when loading a new request
    setError(null);
  };

  const handleSaveRequest = () => {
    console.log('handleSaveRequest called');
    const nameToSave = requestNameForSave.trim(); // Use state for name
    console.log('Name to save:', nameToSave);
    if (!nameToSave) {
      alert('Please enter a name for the request before saving.'); // Use alert for simple feedback
      console.log('Request name is empty');
      return;
    }

    if (activeRequestId) {
      // Update existing request
      setSavedRequests(
        savedRequests.map((req) =>
          req.id === activeRequestId ? { ...req, name: nameToSave, method, url, body: requestBody } : req
        )
      );
    } else {
      // Save as new request
      const newRequest: SavedRequest = {
        id: Date.now().toString(), // Simple unique ID
        name: nameToSave,
        method,
        url,
        body: requestBody,
      };
      setSavedRequests([...savedRequests, newRequest]);
      setActiveRequestId(newRequest.id);
    }
  };

  const handleDeleteRequest = (idToDelete: string) => {
    if (confirm('Are you sure you want to delete this request?')) {
      setSavedRequests(savedRequests.filter(req => req.id !== idToDelete));
      if (activeRequestId === idToDelete) {
        handleNewRequest(); // Clear form if the active request was deleted
      }
    }
  };

  const handleSendRequest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const result = await sendApiRequest(method, url, (method !== 'GET' && method !== 'HEAD') ? requestBody : undefined);
      if (result.isError) {
        setError(result);
      } else if (result.status && result.status >= 200 && result.status < 300) {
        setResponse(result);
      } else {
        setError({
          message: `API Error: Request failed with status code ${result.status || 'unknown'}`,
          status: result.status,
          responseData: result.data,
          headers: result.headers,
          isApiError: true
        });
      }
    } catch (err: any) {
      setError({ message: err.message, isError: true, type: 'ApplicationError' });
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Left Sidebar for Saved Requests */}
      <div style={{ width: '250px', borderRight: '1px solid #ccc', padding: '10px', display: 'flex', flexDirection: 'column', backgroundColor: '#f9f9f9' }}>
        <h2 style={{ marginTop: 0, marginBottom: '10px', fontSize: '1.2em' }}>My Collection</h2>
        <button onClick={handleNewRequest} style={{ marginBottom: '10px', padding: '8px' }}>
          + New Request
        </button>
        <div style={{ flexGrow: 1, overflowY: 'auto' }}>
          {savedRequests.length === 0 && <p style={{color: '#777'}}>No requests saved yet.</p>}
          {savedRequests.map((req) => (
            <div
              key={req.id}
              onClick={() => handleLoadRequest(req)}
              style={{
                padding: '8px 10px',
                margin: '5px 0',
                cursor: 'pointer',
                backgroundColor: activeRequestId === req.id ? '#e0e0e0' : '#fff',
                border: '1px solid #ddd',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span style={{ fontWeight: activeRequestId === req.id ? 'bold' : 'normal'}}>{req.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteRequest(req.id); }}
                style={{padding: '3px 6px', fontSize:'0.8em', backgroundColor:'#ffcccc', border:'none', borderRadius:'3px', cursor:'pointer'}}
              >X</button>
            </div>
          ))}
        </div>
        <p style={{fontSize: '0.8em', color: '#aaa', marginTop: '10px'}}>Health: {healthStatus}</p>
      </div>

      {/* Right Main Area for Request Editing and Response */}
      <div style={{ flexGrow: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto' }}>
        {/* Request Name Input and Save Button */}
        <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
          <input
            type="text"
            placeholder="Request Name (e.g., Get All Todos)"
            value={requestNameForSave}
            onChange={(e) => setRequestNameForSave(e.target.value)}
            style={{flexGrow: 1, padding: '10px', fontSize: '1em', boxSizing: 'border-box'}}
          />
          <button onClick={handleSaveRequest} style={{ padding: '10px 20px', fontSize: '1em', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', flexShrink: 0 }}>
            {activeRequestId ? 'Update Request' : 'Save Request'}
          </button>
        </div>

        {/* Request Method and URL input row */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select value={method} onChange={(e) => setMethod(e.target.value)} style={{ padding: '10px', fontSize: '1em' }}>
            {METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter request URL (e.g., http://localhost:3000/todos)"
            style={{ flexGrow: 1, padding: '10px', fontSize: '1em' }}
          />
        </div>

        {/* Send Button - Placed on its own line for now, or can be moved next to URL if space allows */}
        <div style={{display: 'flex'}}>
          <button onClick={handleSendRequest} disabled={loading} style={{ padding: '10px 20px', fontSize: '1em', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}>
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>

        <div>
          <label htmlFor="requestBodyArea" style={{display: 'block', marginBottom: '5px', fontWeight:'bold'}}>Request Body (JSON):</label>
          <textarea
            id="requestBodyArea"
            value={requestBody}
            onChange={(e) => setRequestBody(e.target.value)}
            placeholder={method === 'GET' || method === 'HEAD' ? 'Body not applicable for an HTTP GET or HEAD request' : 'Enter JSON body'}
            rows={10}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', fontSize: '1em', borderColor: (method === 'GET' || method === 'HEAD') ? '#eee' : '#ccc' }}
            disabled={method === 'GET' || method === 'HEAD'}
          />
        </div>

        <h2>Response</h2>
        {/* Error Display */}
        {error && (
          <div style={{
            border: '2px solid #f44336',
            backgroundColor: '#ffebee',
            padding: '15px',
            margin: '10px 0',
            borderRadius: '4px'
          }}>
            <h3 style={{ color: '#d32f2f', marginTop: 0 }}>Error Details:</h3>
            {error.message && <p style={{ fontWeight: 'bold', color: '#c62828' }}>{error.message}</p>}
            <pre style={{ backgroundColor: '#fce4ec', color: '#ad1457', padding: '10px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', marginTop: '10px', borderRadius: '4px' }}>
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}
        {/* Response Display */}
        {response && (
          <pre style={{ backgroundColor: '#e8f5e9', padding: '15px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', borderRadius: '4px', border: '1px solid #c8e6c9' }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        )}
        {!response && !error && !loading && <p style={{color: '#777'}}>No response yet. Send a request or load a saved one!</p>}
      </div>
    </div>
  );
}
