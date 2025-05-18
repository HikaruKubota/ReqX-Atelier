import React from 'react';

interface RequestNameRowProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  saving: boolean;
  isUpdate: boolean;
}

export const RequestNameRow: React.FC<RequestNameRowProps> = ({
  value,
  onChange,
  onSave,
  saving,
  isUpdate,
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <input
      type="text"
      placeholder="Request Name (e.g., Get User Details)"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ flexGrow: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
    />
    <button
      onClick={onSave}
      disabled={saving}
      style={{
        padding: '8px 15px',
        border: 'none',
        backgroundColor: '#007bff',
        color: 'white',
        borderRadius: '4px',
        cursor: 'pointer',
      }}
    >
      {isUpdate ? 'Update Request' : 'Save Request'}
    </button>
  </div>
);

export default RequestNameRow;
