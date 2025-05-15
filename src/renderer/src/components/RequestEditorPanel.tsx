import * as React from 'react';
import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import type { RequestHeader } from '../hooks/useRequestEditor'; // Import RequestHeader

// キーバリューペアの型定義
interface KeyValuePair {
  id: string;
  keyName: string;
  value: string;
}

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

// 親コンポーネントが呼び出せるメソッドの型定義
export interface RequestEditorPanelRef {
  getRequestBodyAsJson: () => string;
}

interface RequestEditorPanelProps {
  requestNameForSave: string;
  onRequestNameForSaveChange: (name: string) => void;
  method: string;
  onMethodChange: (method: string) => void;
  url: string;
  onUrlChange: (url: string) => void;
  requestBody: string; // This is the JSON string from useRequestEditor, used for initialization
  activeRequestId: string | null;
  loading: boolean;
  onSaveRequest: () => void;
  onSendRequest: () => void;
  headers: RequestHeader[]; // Add headers prop
  onAddHeader: () => void; // Add onAddHeader prop
  onUpdateHeader: (id: string, field: keyof Omit<RequestHeader, 'id'>, value: string | boolean) => void; // Add onUpdateHeader prop
  onRemoveHeader: (id: string) => void; // Add onRemoveHeader prop
}

export const RequestEditorPanel = forwardRef<RequestEditorPanelRef, RequestEditorPanelProps>(({
  requestNameForSave,
  onRequestNameForSaveChange,
  method,
  onMethodChange,
  url,
  onUrlChange,
  requestBody,
  activeRequestId,
  loading,
  onSaveRequest,
  onSendRequest,
  headers,
  onAddHeader,
  onUpdateHeader,
  onRemoveHeader,
}, ref) => {
  const requestBodyEditorRef = useRef<any>(null); // Using any for Monaco editor instance for now

  // キーバリューペアのリストを保持するためのstate
  const [bodyKeyValuePairs, setBodyKeyValuePairs] = useState<KeyValuePair[]>([]);

  // PropsのrequestBody (JSON文字列) から内部Stateへの変換
  useEffect(() => {
    if (method === 'GET' || method === 'HEAD') {
      setBodyKeyValuePairs([]);
      return;
    }
    try {
      const parsedBody = JSON.parse(requestBody || '{}');
      if (typeof parsedBody === 'object' && parsedBody !== null && !Array.isArray(parsedBody)) {
        const newPairs = Object.entries(parsedBody).map(([k, v], index) => ({
          id: `kv-${k}-${index}-${Date.now()}`,
          keyName: k,
          value: typeof v === 'string' ? v : JSON.stringify(v, null, 2),
        }));
        // Avoid unnecessary re-renders if the actual data hasn't changed
        if (JSON.stringify(newPairs) !== JSON.stringify(bodyKeyValuePairs)) {
          setBodyKeyValuePairs(newPairs);
        }
      } else if (requestBody.trim() === '') {
        setBodyKeyValuePairs([]);
      }
    } catch (e) {
      // If parsing fails but body is not empty, it might be non-JSON; clear pairs or handle as error
      if (requestBody && requestBody.trim() !== '') console.warn("Failed to parse requestBody for K-V pairs, it might not be a valid JSON object.", requestBody);
      setBodyKeyValuePairs([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestBody, method]);

  useImperativeHandle(ref, () => ({
    getRequestBodyAsJson: () => {
      if (method === 'GET' || method === 'HEAD') {
        return '';
      }
      try {
        const jsonObject = bodyKeyValuePairs.reduce((obj, pair) => {
          if (pair.keyName.trim() !== '') {
            try {
              obj[pair.keyName] = JSON.parse(pair.value);
            } catch {
              obj[pair.keyName] = pair.value;
            }
          }
          return obj;
        }, {} as Record<string, any>);
        return Object.keys(jsonObject).length > 0 ? JSON.stringify(jsonObject, null, 2) : '';
      } catch (e) {
        // console.error("Error in getRequestBodyAsJson:", e);
        return ''; // Return empty string or indicate error
      }
    }
  }));

  const handleKeyValuePairChange = (id: string, field: 'keyName' | 'value', newValue: string) => {
    setBodyKeyValuePairs(prevPairs =>
      prevPairs.map(pair =>
        pair.id === id ? { ...pair, [field]: newValue } : pair
      )
    );
  };

  const handleAddKeyValuePair = () => {
    setBodyKeyValuePairs(prev => [...prev, { id: `kv-new-${Date.now()}-${Math.random().toString(36).substring(2,9)}`, keyName: '', value: '' }]);
  };

  const handleRemoveKeyValuePair = (id: string) => {
    setBodyKeyValuePairs(prevPairs => prevPairs.filter(pair => pair.id !== id));
  };

  const isBodyApplicable = !(method === 'GET' || method === 'HEAD');

  // JSX for Key-Value editor (replace or integrate with the existing textarea section)
  const bodyEditorUI = isBodyApplicable ? (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {bodyKeyValuePairs.map((pair) => (
        <div key={pair.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Key"
            value={pair.keyName}
            onChange={(e) => handleKeyValuePairChange(pair.id, 'keyName', e.target.value)}
            style={{ flexGrow: 1, padding: '8px', fontSize: '0.95em', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <input
            type="text"
            placeholder="Value (JSON or string)"
            value={pair.value}
            onChange={(e) => handleKeyValuePairChange(pair.id, 'value', e.target.value)}
            style={{ flexGrow: 2, padding: '8px', fontSize: '0.95em', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <button
            onClick={() => handleRemoveKeyValuePair(pair.id)}
            style={{ padding: '6px 10px', fontSize: '0.9em', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        onClick={handleAddKeyValuePair}
        style={{ marginTop: '10px', padding: '8px 15px', fontSize: '0.95em', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', alignSelf: 'flex-start', cursor: 'pointer' }}
      >
        Add Body Row
      </button>
    </div>
  ) : (
    <p style={{ color: '#6c757d', fontSize: '0.9em' }}>Request body is not applicable for {method} requests.</p>
  );

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

      {/* Headers Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h4>Headers</h4>
        {headers.map((header, index) => (
          <div key={header.id} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <input
              type="checkbox"
              checked={header.enabled}
              onChange={(e) => onUpdateHeader(header.id, 'enabled', e.target.checked)}
              title={header.enabled ? "Disable header" : "Enable header"}
              style={{ marginRight: '5px' }}
            />
            <input
              type="text"
              placeholder="Key"
              value={header.key}
              onChange={(e) => onUpdateHeader(header.id, 'key', e.target.value)}
              style={{ flex: 1, padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <input
              type="text"
              placeholder="Value"
              value={header.value}
              onChange={(e) => onUpdateHeader(header.id, 'value', e.target.value)}
              style={{ flex: 2, padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <button onClick={() => onRemoveHeader(header.id)} style={{ padding: '6px 10px', border: '1px solid #dc3545', color: '#dc3545', backgroundColor: 'white', borderRadius: '4px', cursor: 'pointer' }}>
              Remove
            </button>
          </div>
        ))}
        <button onClick={onAddHeader} style={{ padding: '8px 15px', border: '1px solid #007bff', color: '#007bff', backgroundColor: 'white', borderRadius: '4px', cursor: 'pointer', alignSelf: 'flex-start' }}>
          Add Header
        </button>
      </div>

      {/* Request Body Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <h4>Request Body</h4>
        {bodyEditorUI}
        {/* The textarea can be removed or kept for raw JSON viewing if desired, but editing should primarily be via key-value pairs if that's the intent. */}
        {/* <textarea value={requestBody} readOnly style={{ width: '100%', minHeight: '100px', display: isBodyApplicable && bodyKeyValuePairs.length > 0 ? 'block' : 'none' }} /> */}
      </div>
    </div>
  );
});

RequestEditorPanel.displayName = 'RequestEditorPanel';
