// src/App.jsx
import { useEffect, useCallback, useRef } from 'react';
import { useSavedRequests, SavedRequest } from './hooks/useSavedRequests'; // Import the custom hook and type
import { useRequestEditor, RequestHeader } from './hooks/useRequestEditor'; // Import the new hook and RequestHeader
import { useApiResponseHandler } from './hooks/useApiResponseHandler'; // Import the new API response handler hook
import { RequestCollectionSidebar } from './components/RequestCollectionSidebar'; // Import the new sidebar component
import { RequestEditorPanel, RequestEditorPanelRef } from './components/RequestEditorPanel'; // Import the new editor panel component and ref type
import { ResponseDisplayPanel } from './components/ResponseDisplayPanel'; // Import the new response panel component
import type { KeyValuePair } from './components/BodyEditorKeyValue'; // Import KeyValuePair for explicit typing if needed

export default function App() {
  const editorPanelRef = useRef<RequestEditorPanelRef>(null); // Create a ref

  // Use the new custom hook for request editor state and logic
  const {
    method, setMethod, methodRef,
    url, setUrl, urlRef,
    currentBodyKeyValuePairs, // Get the new state for KV pairs
    requestNameForSave, setRequestNameForSave, requestNameForSaveRef,
    activeRequestId, setActiveRequestId, activeRequestIdRef,
    headers, setHeaders, headersRef, // Destructure headers state and functions
    addHeader, updateHeader, removeHeader, // Destructure header actions
    loadRequest: loadRequestIntoEditor, // Renamed to avoid conflict if there was a local var named loadRequest
    resetEditor
  } = useRequestEditor();

  // Use the new API response handler hook
  const { response, error, loading, executeRequest, resetApiResponse } = useApiResponseHandler();

  // Saved requests state (from useSavedRequests hook)
  const { savedRequests, addRequest, updateRequest: updateSavedRequest, deleteRequest } = useSavedRequests();

  // Memoize handleSendRequest with useCallback
  const handleSendRequest = useCallback(async () => {
    const currentBuiltRequestBody = editorPanelRef.current?.getRequestBodyAsJson() || '';
    const activeHeaders = headersRef.current
      .filter(h => h.enabled && h.key.trim() !== '')
      .reduce((acc, h) => {
        acc[h.key] = h.value;
        return acc;
      }, {} as Record<string, string>);
    await executeRequest(methodRef.current, urlRef.current, currentBuiltRequestBody, activeHeaders);
  }, [executeRequest, headersRef, methodRef, urlRef]);

  const executeSaveRequest = useCallback(() => {
    const nameToSave = requestNameForSaveRef.current.trim();
    const currentMethod = methodRef.current;
    const currentUrl = urlRef.current;
    const currentBodyKeyValuePairsFromEditor = editorPanelRef.current?.getRequestBodyKeyValuePairs() || []; // New way
    const currentActiveRequestId = activeRequestIdRef.current;
    const currentHeaders = headersRef.current;

    console.log('[App - executeSaveRequest] Called. Name:', nameToSave, 'Active ID:', currentActiveRequestId);
    if (!nameToSave) {
      alert('Please enter a name for the request before saving.');
      return;
    }

    const requestDataToSave: Omit<SavedRequest, 'id'> = {
      name: nameToSave,
      method: currentMethod,
      url: currentUrl,
      headers: currentHeaders,
      bodyKeyValuePairs: currentBodyKeyValuePairsFromEditor,
    };

    if (currentActiveRequestId) {
      console.log('[App - executeSaveRequest] Updating existing request ID:', currentActiveRequestId);
      updateSavedRequest(currentActiveRequestId, requestDataToSave);
    } else {
      console.log('[App - executeSaveRequest] Saving as new request:', requestDataToSave);
      const newId = addRequest(requestDataToSave as SavedRequest);
      setActiveRequestId(newId);
      console.log('[App - executeSaveRequest] New activeRequestId set to:', newId);
    }
  }, [addRequest, updateSavedRequest, setActiveRequestId, requestNameForSaveRef, methodRef, urlRef, activeRequestIdRef, headersRef]);
  // Dependencies: functions from hooks are stable. Refs are stable. setActiveRequestId is stable.

  const handleSaveButtonClick = useCallback(() => {
    executeSaveRequest();
  }, [executeSaveRequest]);

  // Memoize handleNewRequest
  const handleNewRequest = useCallback(() => {
    resetEditor();
    resetApiResponse();
  }, [resetEditor, resetApiResponse]);

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
    resetApiResponse();
  };

  const handleDeleteRequest = useCallback((idToDelete: string) => {
    if (confirm('Are you sure you want to delete this request?')) {
      console.log('[App - handleDeleteRequest] Deleting request ID:', idToDelete);
      deleteRequest(idToDelete);
      if (activeRequestId === idToDelete) {
        resetEditor();
        resetApiResponse();
      }
    }
  }, [deleteRequest, activeRequestId, resetEditor, resetApiResponse]);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Use the new RequestCollectionSidebar component */}
      <RequestCollectionSidebar
        savedRequests={savedRequests}
        activeRequestId={activeRequestId}
        onNewRequest={handleNewRequest}
        onLoadRequest={handleLoadRequest}
        onDeleteRequest={handleDeleteRequest}
      />

      {/* Right Main Area for Request Editing and Response */}
      <div style={{ flexGrow: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto' }}>
        {/* Use the new RequestEditorPanel component */}
        <RequestEditorPanel
          ref={editorPanelRef}
          requestNameForSave={requestNameForSave}
          onRequestNameForSaveChange={setRequestNameForSave}
          method={method}
          onMethodChange={setMethod}
          url={url}
          onUrlChange={setUrl}
          initialBodyKeyValuePairs={currentBodyKeyValuePairs}
          activeRequestId={activeRequestId}
          loading={loading}
          onSaveRequest={handleSaveButtonClick}
          onSendRequest={handleSendRequest}
          headers={headers}
          onAddHeader={addHeader}
          onUpdateHeader={updateHeader}
          onRemoveHeader={removeHeader}
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
