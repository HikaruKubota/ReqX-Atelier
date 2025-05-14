// src/App.jsx
import { useEffect, useState, useCallback } from 'react';
import { health, sendApiRequest } from './api'; // Corrected path
import { useSavedRequests, SavedRequest } from './hooks/useSavedRequests'; // Import the custom hook and type
import { useRequestEditor } from './hooks/useRequestEditor'; // Import the new hook

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

export default function App() {
  const [healthStatus, setHealthStatus] = useState('');

  // Use the new custom hook for request editor state and logic
  const {
    method, setMethod, methodRef,
    url, setUrl, urlRef,
    requestBody, setRequestBody, requestBodyRef,
    requestNameForSave, setRequestNameForSave, requestNameForSaveRef,
    activeRequestId, setActiveRequestId, activeRequestIdRef,
    loadRequest: loadRequestIntoEditor, // Renamed to avoid conflict if there was a local var named loadRequest
    resetEditor
  } = useRequestEditor();

  // Response/Error state (remains in App.tsx as it's not part of editor state)
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Saved requests state (from useSavedRequests hook)
  const { savedRequests, addRequest, updateRequest, deleteRequest } = useSavedRequests();

  // Memoize handleSendRequest with useCallback - MOVED UP before handleKeyDown
  const handleSendRequest = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      // method, url, requestBody now come from useRequestEditor state
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
  }, [method, url, requestBody, setLoading, setError, setResponse]); // Add dependencies

  const executeSaveRequest = useCallback(() => {
    const nameToSave = requestNameForSaveRef.current.trim(); // Use ref from hook
    const currentMethod = methodRef.current; // Use ref from hook
    const currentUrl = urlRef.current; // Use ref from hook
    const currentRequestBody = requestBodyRef.current; // Use ref from hook
    const currentActiveRequestId = activeRequestIdRef.current; // Use ref from hook

    console.log('[App - executeSaveRequest] Called. Name:', nameToSave, 'Active ID:', currentActiveRequestId);
    if (!nameToSave) {
      alert('Please enter a name for the request before saving.');
      return;
    }

    const requestDataToSave = {
      name: nameToSave,
      method: currentMethod,
      url: currentUrl,
      body: currentRequestBody,
    };

    if (currentActiveRequestId) {
      console.log('[App - executeSaveRequest] Updating existing request ID:', currentActiveRequestId);
      updateRequest(currentActiveRequestId, requestDataToSave);
    } else {
      console.log('[App - executeSaveRequest] Saving as new request:', requestDataToSave);
      const newId = addRequest(requestDataToSave);
      setActiveRequestId(newId); // Set the new ID as active (this comes from useRequestEditor)
      console.log('[App - executeSaveRequest] New activeRequestId set to:', newId);
    }
    // Note: requestNameForSave (state) is already updated by its input's onChange.
    // requestNameForSaveRef will be up-to-date.
  }, [addRequest, updateRequest, setActiveRequestId, requestNameForSaveRef, methodRef, urlRef, requestBodyRef, activeRequestIdRef]);
  // Dependencies: functions from hooks are stable. Refs are stable. setActiveRequestId is stable.

  const handleSaveButtonClick = useCallback(() => {
    executeSaveRequest();
  }, [executeSaveRequest]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Command/Ctrl + S for saving
    if ((event.metaKey || event.ctrlKey) && event.key === 's') {
      event.preventDefault();
      executeSaveRequest();
    }

    // Command/Ctrl + Enter for sending request
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      handleSendRequest();
    }
  }, [executeSaveRequest, handleSendRequest]);

  // Initial load useEffect (health check, key listener setup)
  useEffect(() => {
    console.log('[App - useEffect InitialLoad] Mounting. Adding listener.');
    const fetchHealth = async () => {
      try { const res = await health(); setHealthStatus(res); } catch (err) { setHealthStatus('Error fetching health'); console.error(err); }
    };
    fetchHealth();

    window.addEventListener('keydown', handleKeyDown);
    console.log('[App - useEffect InitialLoad] Keydown listener added.');
    return () => {
      console.log('[App - useEffect InitialLoad] Cleanup: Keydown listener removed.');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleNewRequest = () => {
    resetEditor(); // Use resetEditor from the hook
    setResponse(null); // Clear response/error state which is local to App.tsx
    setError(null);
  };

  const handleLoadRequest = (req: SavedRequest) => {
    loadRequestIntoEditor(req); // Use loadRequest from the hook
    setResponse(null); // Clear previous response when loading a new request
    setError(null);
  };

  const handleDeleteRequest = useCallback((idToDelete: string) => {
    if (confirm('Are you sure you want to delete this request?')) {
      console.log('[App - handleDeleteRequest] Deleting request ID:', idToDelete);
      deleteRequest(idToDelete);
      if (activeRequestId === idToDelete) { // activeRequestId from useRequestEditor
        resetEditor(); // Clear form if the active request was deleted
        setResponse(null);
        setError(null);
      }
    }
  }, [deleteRequest, activeRequestId, resetEditor]); // Added activeRequestId & resetEditor from hook

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
          {savedRequests.map((req: SavedRequest) => ( // Explicitly type req
            <div
              key={req.id}
              onClick={() => handleLoadRequest(req)}
              style={{
                padding: '8px 10px',
                margin: '5px 0',
                cursor: 'pointer',
                backgroundColor: activeRequestId === req.id ? '#e0e0e0' : '#fff', // activeRequestId from hook
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
            value={requestNameForSave} // From hook
            onChange={(e) => setRequestNameForSave(e.target.value)} // From hook
            style={{flexGrow: 1, padding: '10px', fontSize: '1em', boxSizing: 'border-box'}}
          />
          <button onClick={handleSaveButtonClick} style={{ padding: '10px 20px', fontSize: '1em', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', flexShrink: 0 }}>
            {activeRequestId ? 'Update Request' : 'Save Request'} {/* activeRequestId from hook */}
          </button>
        </div>

        {/* Request Method and URL input row */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select value={method} onChange={(e) => setMethod(e.target.value)} style={{ padding: '10px', fontSize: '1em' }}> {/* method, setMethod from hook */}
            {METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <input
            type="text"
            value={url} // From hook
            onChange={(e) => setUrl(e.target.value)} // From hook
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
            value={requestBody} // From hook
            onChange={(e) => setRequestBody(e.target.value)} // From hook
            placeholder={method === 'GET' || method === 'HEAD' ? 'Body not applicable for an HTTP GET or HEAD request' : 'Enter JSON body'} // method from hook
            rows={10}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', fontSize: '1em', borderColor: (method === 'GET' || method === 'HEAD') ? '#eee' : '#ccc' }} // method from hook
            disabled={method === 'GET' || method === 'HEAD'} // method from hook
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
