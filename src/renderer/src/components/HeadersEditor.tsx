import * as React from 'react';
import type { RequestHeader } from '../types';

interface HeadersEditorProps {
  headers: RequestHeader[];
  onAddHeader: () => void;
  onUpdateHeader: (
    id: string,
    field: keyof Omit<RequestHeader, 'id'>,
    value: string | boolean,
  ) => void;
  onRemoveHeader: (id: string) => void;
}

export const HeadersEditor: React.FC<HeadersEditorProps> = ({
  headers,
  onAddHeader,
  onUpdateHeader,
  onRemoveHeader,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <h4>Headers</h4>
      {headers.map((header) => (
        <div key={header.id} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <input
            type="checkbox"
            checked={header.enabled}
            onChange={(e) => onUpdateHeader(header.id, 'enabled', e.target.checked)}
            title={header.enabled ? 'Disable header' : 'Enable header'}
            style={{ marginRight: '5px' }}
          />
          <input
            type="text"
            placeholder="Key"
            value={header.key}
            onChange={(e) => onUpdateHeader(header.id, 'key', e.target.value)}
            style={{ flex: 1, padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
            disabled={!header.enabled}
          />
          <input
            type="text"
            placeholder="Value"
            value={header.value}
            onChange={(e) => onUpdateHeader(header.id, 'value', e.target.value)}
            style={{ flex: 2, padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
            disabled={!header.enabled}
          />
          <button
            onClick={() => onRemoveHeader(header.id)}
            style={{
              padding: '6px 10px',
              border: '1px solid #dc3545',
              color: '#dc3545',
              backgroundColor: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        onClick={onAddHeader}
        style={{
          padding: '8px 15px',
          border: '1px solid #007bff',
          color: '#007bff',
          backgroundColor: 'white',
          borderRadius: '4px',
          cursor: 'pointer',
          alignSelf: 'flex-start',
        }}
      >
        Add Header
      </button>
    </div>
  );
};
