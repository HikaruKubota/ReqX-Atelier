import * as React from 'react';

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

interface RequestEditorPanelProps {
  requestNameForSave: string;
  onRequestNameForSaveChange: (value: string) => void;
  method: string;
  onMethodChange: (value: string) => void;
  url: string;
  onUrlChange: (value: string) => void;
  requestBody: string;
  onRequestBodyChange: (value: string) => void;
  activeRequestId: string | null;
  loading: boolean;
  onSaveRequest: () => void;
  onSendRequest: () => void;
}

export const RequestEditorPanel: React.FC<RequestEditorPanelProps> = ({
  requestNameForSave,
  onRequestNameForSaveChange,
  method,
  onMethodChange,
  url,
  onUrlChange,
  requestBody,
  onRequestBodyChange,
  activeRequestId,
  loading,
  onSaveRequest,
  onSendRequest,
}) => {
  return (
    <>
      {/* Request Name Input and Save Button */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Request Name (e.g., Get All Todos)"
          value={requestNameForSave}
          onChange={(e) => onRequestNameForSaveChange(e.target.value)}
          style={{ flexGrow: 1, padding: '10px', fontSize: '1em', boxSizing: 'border-box' }}
        />
        <button
          onClick={onSaveRequest}
          style={{ padding: '10px 20px', fontSize: '1em', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', flexShrink: 0 }}
        >
          {activeRequestId ? 'Update Request' : 'Save Request'}
        </button>
      </div>

      {/* Request Method and URL input row */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <select value={method} onChange={(e) => onMethodChange(e.target.value)} style={{ padding: '10px', fontSize: '1em' }}>
          {METHODS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input
          type="text"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="Enter request URL (e.g., http://localhost:3000/todos)"
          style={{ flexGrow: 1, padding: '10px', fontSize: '1em' }}
        />
      </div>

      {/* Send Button */}
      <div style={{ display: 'flex' }}>
        <button
          onClick={onSendRequest}
          disabled={loading}
          style={{ padding: '10px 20px', fontSize: '1em', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>

      <div>
        <label htmlFor="requestBodyArea" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Request Body (JSON):</label>
        <textarea
          id="requestBodyArea"
          value={requestBody}
          onChange={(e) => onRequestBodyChange(e.target.value)}
          placeholder={method === 'GET' || method === 'HEAD' ? 'Body not applicable for an HTTP GET or HEAD request' : 'Enter JSON body'}
          rows={10}
          style={{ width: '100%', padding: '10px', boxSizing: 'border-box', fontSize: '1em', borderColor: (method === 'GET' || method === 'HEAD') ? '#eee' : '#ccc' }}
          disabled={method === 'GET' || method === 'HEAD'}
        />
      </div>
    </>
  );
};
