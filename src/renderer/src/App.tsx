// src/App.jsx
import { useEffect, useState, useCallback, useRef } from 'react';
import { sendApiRequest } from './api'; // Corrected path
import { useSavedRequests, SavedRequest } from './hooks/useSavedRequests'; // Import the custom hook and type
import { useRequestEditor } from './hooks/useRequestEditor'; // Import the new hook
import { RequestCollectionSidebar } from './components/RequestCollectionSidebar'; // Import the new sidebar component
import { RequestEditorPanel, RequestEditorPanelRef } from './components/RequestEditorPanel'; // Import the new editor panel component and ref type
import { ResponseDisplayPanel } from './components/ResponseDisplayPanel'; // Import the new response panel component

export default function App() {
  const editorPanelRef = useRef<RequestEditorPanelRef>(null); // Create a ref

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
      const currentBuiltRequestBody = editorPanelRef.current?.getRequestBodyAsJson() || '';
      const result = await sendApiRequest(method, url, (method !== 'GET' && method !== 'HEAD') ? currentBuiltRequestBody : undefined);
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
  }, [method, url, setLoading, setError, setResponse]);

  const executeSaveRequest = useCallback(() => {
    const nameToSave = requestNameForSaveRef.current.trim();
    const currentMethod = methodRef.current;
    const currentUrl = urlRef.current;
    const currentBuiltRequestBody = editorPanelRef.current?.getRequestBodyAsJson() || '';
    const currentActiveRequestId = activeRequestIdRef.current;

    console.log('[App - executeSaveRequest] Called. Name:', nameToSave, 'Active ID:', currentActiveRequestId);
    if (!nameToSave) {
      alert('Please enter a name for the request before saving.');
      return;
    }

    const requestDataToSave = {
      name: nameToSave,
      method: currentMethod,
      url: currentUrl,
      body: currentBuiltRequestBody,
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
    setRequestBody(currentBuiltRequestBody);
  }, [addRequest, updateRequest, setActiveRequestId, requestNameForSaveRef, methodRef, urlRef, activeRequestIdRef, setRequestBody]);
  // Dependencies: functions from hooks are stable. Refs are stable. setActiveRequestId is stable.

  const handleSaveButtonClick = useCallback(() => {
    executeSaveRequest();
  }, [executeSaveRequest]);

  // Memoize handleNewRequest
  const handleNewRequest = useCallback(() => {
    resetEditor();
    setRequestBody('');
    setResponse(null);
    setError(null);
  }, [resetEditor, setRequestBody, setResponse, setError]);

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

    window.addEventListener('keydown', handleKeyDown);
    console.log('[App - useEffect InitialLoad] Keydown listener added.');
    return () => {
      console.log('[App - useEffect InitialLoad] Cleanup: Keydown listener removed.');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleLoadRequest = (req: SavedRequest) => {
    loadRequestIntoEditor(req);
    setResponse(null);
    setError(null);
  };

  const handleDeleteRequest = useCallback((idToDelete: string) => {
    if (confirm('Are you sure you want to delete this request?')) {
      console.log('[App - handleDeleteRequest] Deleting request ID:', idToDelete);
      deleteRequest(idToDelete);
      if (activeRequestId === idToDelete) { // activeRequestId from useRequestEditor
        resetEditor();
        setRequestBody('');
        setResponse(null);
        setError(null);
      }
    }
  }, [deleteRequest, activeRequestId, resetEditor, setRequestBody]); // Added activeRequestId & resetEditor from hook

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Use the new RequestCollectionSidebar component */}
      <RequestCollectionSidebar
        savedRequests={savedRequests}
        activeRequestId={activeRequestId}
        onNewRequest={handleNewRequest}
        onLoadRequest={handleLoadRequest} // Pass the original handleLoadRequest
        onDeleteRequest={handleDeleteRequest}
      />

      {/* Right Main Area for Request Editing and Response */}
      <div style={{ flexGrow: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto' }}>
        {/* Use the new RequestEditorPanel component */}
        <RequestEditorPanel
          ref={editorPanelRef}
          requestNameForSave={requestNameForSave}
          onRequestNameForSaveChange={setRequestNameForSave} // Pass setter from useRequestEditor
          method={method}
          onMethodChange={setMethod} // Pass setter from useRequestEditor
          url={url}
          onUrlChange={setUrl} // Pass setter from useRequestEditor
          requestBody={requestBody}
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
