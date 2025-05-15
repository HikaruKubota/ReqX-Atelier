import * as React from 'react';
import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';

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
  onRequestNameForSaveChange: (value: string) => void;
  method: string;
  onMethodChange: (value: string) => void;
  url: string;
  onUrlChange: (value: string) => void;
  requestBody: string; // 外部からロードされた時の初期JSONボディ
  activeRequestId: string | null;
  loading: boolean;
  onSaveRequest: () => void;
  onSendRequest: () => void; // 引数なしに戻す (App.tsxでref経由で取得するため)
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
}, ref) => {
  // キーバリューペアのリストを保持するためのstate
  const [bodyKeyValuePairs, setBodyKeyValuePairs] = useState<KeyValuePair[]>([]);

  // PropsのrequestBody (JSON文字列) から内部Stateへの変換
  useEffect(() => {
    if (method === 'GET' || method === 'HEAD') {
      if (bodyKeyValuePairs.length > 0) {
        setBodyKeyValuePairs([]);
      }
      return;
    }

    let newPairs: KeyValuePair[] = [];
    if (typeof requestBody === 'string' && requestBody.trim() !== '') {
      try {
        const parsedBody = JSON.parse(requestBody);
        if (typeof parsedBody === 'object' && parsedBody !== null && !Array.isArray(parsedBody)) {
          newPairs = Object.entries(parsedBody).map(([k, v], index) => ({
            id: `kv-${k}-${index}-${Date.now()}`,
            keyName: k,
            value: typeof v === 'string' ? v : JSON.stringify(v),
          }));
        }
      } catch (e) {
        // console.error('Failed to parse requestBody for initial K-V pairs:', e, 'Raw body:', requestBody);
      }
    }

    if (newPairs.length !== bodyKeyValuePairs.length ||
        !newPairs.every((pair, index) =>
          bodyKeyValuePairs[index] &&
          pair.keyName === bodyKeyValuePairs[index].keyName &&
          pair.value === bodyKeyValuePairs[index].value
        )) {
      setBodyKeyValuePairs(newPairs);
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
        return '';
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
    const newPair = { id: `kv-new-${Date.now()}`, keyName: '', value: '' };
    const updatedPairs = [...bodyKeyValuePairs, newPair];
    setBodyKeyValuePairs(updatedPairs);
  };

  const handleRemoveKeyValuePair = (id: string) => {
    const updatedPairs = bodyKeyValuePairs.filter(pair => pair.id !== id);
    setBodyKeyValuePairs(updatedPairs);
  };

  const isBodyApplicable = !(method === 'GET' || method === 'HEAD');

  return (
    <>
      {/* Request Name Input and Save Button */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
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
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
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
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={onSendRequest}
          disabled={loading}
          style={{ padding: '10px 20px', fontSize: '1em', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>

      {/* Request Body Section */}
      <div>
        <h3 style={{ marginBottom: '10px', fontSize: '1.1em', fontWeight: 'bold' }}>Request Body (Key-Value Pairs)</h3>
        {isBodyApplicable ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {bodyKeyValuePairs.map((pair) => (
              <div key={pair.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Key"
                  value={pair.keyName}
                  onChange={(e) => handleKeyValuePairChange(pair.id, 'keyName', e.target.value)}
                  style={{ flexGrow: 1, padding: '8px', fontSize: '0.95em', boxSizing: 'border-box' }}
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={pair.value}
                  onChange={(e) => handleKeyValuePairChange(pair.id, 'value', e.target.value)}
                  style={{ flexGrow: 2, padding: '8px', fontSize: '0.95em', boxSizing: 'border-box' }}
                />
                <button
                  onClick={() => handleRemoveKeyValuePair(pair.id)}
                  style={{ padding: '6px 10px', fontSize: '0.9em', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={handleAddKeyValuePair}
              style={{ marginTop: '10px', padding: '8px 15px', fontSize: '0.95em', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', alignSelf: 'flex-start' }}
            >
              Add Row
            </button>
          </div>
        ) : (
          <p style={{ color: '#777', fontStyle: 'italic' }}>
            Request body is not applicable for {method} requests.
          </p>
        )}
      </div>
    </>
  );
});
