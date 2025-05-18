import React from 'react';

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

interface RequestMethodRowProps {
  method: string;
  onMethodChange: (method: string) => void;
  url: string;
  onUrlChange: (url: string) => void;
  loading: boolean;
  onSend: () => void;
}

export const RequestMethodRow: React.FC<RequestMethodRowProps> = ({
  method,
  onMethodChange,
  url,
  onUrlChange,
  loading,
  onSend,
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <select
      value={method}
      onChange={(e) => onMethodChange(e.target.value)}
      style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
    >
      {METHODS.map((m) => (
        <option key={m} value={m}>
          {m}
        </option>
      ))}
    </select>
    <input
      type="text"
      placeholder="Enter request URL (e.g., https://api.example.com/users)"
      value={url}
      onChange={(e) => onUrlChange(e.target.value)}
      style={{ flexGrow: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
    />
    <button
      onClick={onSend}
      disabled={loading}
      style={{
        padding: '8px 15px',
        border: 'none',
        backgroundColor: '#28a745',
        color: 'white',
        borderRadius: '4px',
        cursor: 'pointer',
      }}
    >
      {loading ? 'Sending...' : 'Send'}
    </button>
  </div>
);

export default RequestMethodRow;
