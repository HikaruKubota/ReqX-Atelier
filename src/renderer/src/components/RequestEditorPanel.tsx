import { useImperativeHandle, forwardRef, useRef } from 'react';
import type { RequestHeader } from '../hooks/useHeadersManager';
import { HeadersEditor } from './HeadersEditor';
import { BodyEditorKeyValue, BodyEditorKeyValueRef, KeyValuePair } from './BodyEditorKeyValue';
import { RequestNameRow } from './molecules/RequestNameRow';
import { RequestMethodRow } from './molecules/RequestMethodRow';

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
  onUpdateHeader: (id: string, field: 'key' | 'value' | 'enabled', value: string | boolean) => void;
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
      <RequestNameRow
        value={requestNameForSave}
        onChange={onRequestNameForSaveChange}
        onSave={onSaveRequest}
        saving={loading}
        isUpdate={!!activeRequestId}
      />

      <RequestMethodRow
        method={method}
        onMethodChange={onMethodChange}
        url={url}
        onUrlChange={onUrlChange}
        loading={loading}
        onSend={onSendRequest}
      />

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
