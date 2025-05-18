import React from 'react';
import type { RequestFolder } from '../../types';

interface RequestFolderRowProps {
  folders: RequestFolder[];
  value: string;
  onChange: (id: string) => void;
}

export const RequestFolderRow: React.FC<RequestFolderRowProps> = ({ folders, value, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
    >
      {folders.map((f) => (
        <option key={f.id} value={f.id}>
          {f.name}
        </option>
      ))}
    </select>
  </div>
);

export default RequestFolderRow;
