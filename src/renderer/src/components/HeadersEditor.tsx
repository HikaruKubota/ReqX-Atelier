import * as React from 'react';
import type { RequestHeader } from '../types';
import { TrashButton } from './atoms/button/TrashButton';

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
    <div className="flex flex-col gap-2">
      <h4>Headers</h4>
      {headers.map((header) => (
        <div key={header.id} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={header.enabled}
            onChange={(e) => onUpdateHeader(header.id, 'enabled', e.target.checked)}
            title={header.enabled ? 'Disable header' : 'Enable header'}
            className="mr-1"
          />
          <input
            type="text"
            placeholder="Key"
            value={header.key}
            onChange={(e) => onUpdateHeader(header.id, 'key', e.target.value)}
            className="w-32 p-2 border border-gray-300 rounded"
            disabled={!header.enabled}
          />
          <input
            type="text"
            placeholder="Value"
            value={header.value}
            onChange={(e) => onUpdateHeader(header.id, 'value', e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded"
            disabled={!header.enabled}
          />
          <TrashButton onClick={() => onRemoveHeader(header.id)} />
        </div>
      ))}
      <button
        onClick={onAddHeader}
        className="px-4 py-2 border border-blue-500 text-blue-500 bg-white rounded self-start"
      >
        Add Header
      </button>
    </div>
  );
};
