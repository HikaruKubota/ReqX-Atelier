// src/App.jsx
import { useEffect, useState, useCallback } from 'react';
import { health, sendApiRequest } from './api'; // Corrected path
import { useSavedRequests, SavedRequest } from './hooks/useSavedRequests'; // Import the custom hook and type
import { useRequestEditor } from './hooks/useRequestEditor'; // Import the new hook
import { RequestCollectionSidebar } from './components/RequestCollectionSidebar'; // Import the new sidebar component
import { RequestEditorPanel } from './components/RequestEditorPanel'; // Import the new editor panel component
import { ResponseDisplayPanel } from './components/ResponseDisplayPanel'; // Import the new response panel component

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
  }, [method, url, requestBody, setLoading, setError, setResponse]);

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

  // Memoize handleNewRequest
  const handleNewRequest = useCallback(() => {
    resetEditor(); // Use resetEditor from the hook
    setResponse(null); // Clear response/error state which is local to App.tsx
    setError(null);
  }, [resetEditor, setResponse, setError]);

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

    // Command/Ctrl + N for new request
    if ((event.metaKey || event.ctrlKey) && event.key === 'n') {
      event.preventDefault();
      handleNewRequest();
    }
  }, [executeSaveRequest, handleSendRequest, handleNewRequest]); // Added handleNewRequest

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
      {/* Use the new RequestCollectionSidebar component */}
      <RequestCollectionSidebar
        savedRequests={savedRequests}
        activeRequestId={activeRequestId}
        onNewRequest={handleNewRequest}
        onLoadRequest={handleLoadRequest} // Pass the original handleLoadRequest
        onDeleteRequest={handleDeleteRequest}
        healthStatus={healthStatus}
      />

      {/* Right Main Area for Request Editing and Response */}
      <div style={{ flexGrow: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto' }}>
        {/* Use the new RequestEditorPanel component */}
        <RequestEditorPanel
          requestNameForSave={requestNameForSave}
          onRequestNameForSaveChange={setRequestNameForSave} // Pass setter from useRequestEditor
          method={method}
          onMethodChange={setMethod} // Pass setter from useRequestEditor
          url={url}
          onUrlChange={setUrl} // Pass setter from useRequestEditor
          requestBody={requestBody}
          onRequestBodyChange={setRequestBody} // Pass setter from useRequestEditor
          activeRequestId={activeRequestId}
          loading={loading}
          onSaveRequest={handleSaveButtonClick} // Pass memoized handler from App
          onSendRequest={handleSendRequest}     // Pass memoized handler from App
        />

        {/* Use the new ResponseDisplayPanel component */}
        <ResponseDisplayPanel
          response={response}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  );
}
