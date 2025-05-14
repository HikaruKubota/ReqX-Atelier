import * as React from 'react';

interface ResponseDisplayPanelProps {
  response: any;
  error: any;
  loading: boolean;
}

export const ResponseDisplayPanel: React.FC<ResponseDisplayPanelProps> = ({
  response,
  error,
  loading,
}) => {
  return (
    <>
      <h2>Response</h2>
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
      {response && (
        <pre style={{ backgroundColor: '#e8f5e9', padding: '15px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', borderRadius: '4px', border: '1px solid #c8e6c9' }}>
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
      {!response && !error && !loading && <p style={{ color: '#777' }}>No response yet. Send a request or load a saved one!</p>}
      {loading && <p style={{color: '#777'}}>Loading...</p>}
    </>
  );
};
