import { useImperativeHandle, forwardRef, useRef } from 'react';
import type { RequestHeader } from '../hooks/useRequestEditor';
import { HeadersEditor } from './HeadersEditor';
import { BodyEditorKeyValue, BodyEditorKeyValueRef, KeyValuePair } from './BodyEditorKeyValue';

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

export interface RequestEditorPanelRef {
  getRequestBodyAsJson: () => string;
  getRequestBodyKeyValuePairs: () => KeyValuePair[];
}

interface RequestEditorPanelProps {
  requestNameForSave: string;
  onRequestNameForSaveChange: (name: string) => void;
  method: string;
  onMethodChange: (method: string) => void;
  url: string;
  onUrlChange: (url: string) => void;
  initialBodyKeyValuePairs?: KeyValuePair[];
  activeRequestId: string | null;
  loading: boolean;
  onSaveRequest: () => void;
  onSendRequest: () => void;
  headers: RequestHeader[];
  onAddHeader: () => void;
  onUpdateHeader: (id: string, field: keyof Omit<RequestHeader, 'id'>, value: string | boolean) => void;
  onRemoveHeader: (id: string) => void;
}

export const RequestEditorPanel = forwardRef<RequestEditorPanelRef, RequestEditorPanelProps>((
  { requestNameForSave, onRequestNameForSaveChange, method, onMethodChange, url, onUrlChange, initialBodyKeyValuePairs, activeRequestId, loading, onSaveRequest, onSendRequest, headers, onAddHeader, onUpdateHeader, onRemoveHeader },
  ref
) => {
  const bodyEditorRef = useRef<BodyEditorKeyValueRef>(null);

  useImperativeHandle(ref, () => ({
    getRequestBodyAsJson: () => {
      return bodyEditorRef.current?.getCurrentBodyAsJson() || '';
    },
    getRequestBodyKeyValuePairs: () => {
      return bodyEditorRef.current?.getCurrentKeyValuePairs() || [];
    }
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
      {/* Request Name and Save Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input
          type="text"
          placeholder="Request Name (e.g., Get User Details)"
          value={requestNameForSave}
          onChange={(e) => onRequestNameForSaveChange(e.target.value)}
          style={{ flexGrow: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <button onClick={onSaveRequest} disabled={loading} style={{ padding: '8px 15px', border: 'none', backgroundColor: '#007bff', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>
          {activeRequestId ? 'Update Request' : 'Save Request'}
        </button>
      </div>

      {/* Method, URL, Send Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <select value={method} onChange={(e) => onMethodChange(e.target.value)} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
          {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input
          type="text"
          placeholder="Enter request URL (e.g., https://api.example.com/users)"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          style={{ flexGrow: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <button onClick={onSendRequest} disabled={loading} style={{ padding: '8px 15px', border: 'none', backgroundColor: '#28a745', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>

      <HeadersEditor
        headers={headers}
        onAddHeader={onAddHeader}
        onUpdateHeader={onUpdateHeader}
        onRemoveHeader={onRemoveHeader}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <h4>Request Body</h4>
        <BodyEditorKeyValue
          ref={bodyEditorRef}
          initialBodyKeyValuePairs={initialBodyKeyValuePairs}
          method={method}
        />
      </div>
    </div>
  );
});

RequestEditorPanel.displayName = 'RequestEditorPanel';
