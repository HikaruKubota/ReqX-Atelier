import React, { useImperativeHandle, forwardRef, useRef } from 'react';
import type {
  RequestHeader,
  BodyEditorKeyValueRef,
  KeyValuePair,
  RequestEditorPanelRef,
} from '../types';
import { HeadersEditor } from './HeadersEditor';
import { BodyEditorKeyValue } from './BodyEditorKeyValue';
import { ScrollableContainer } from './atoms/ScrollableContainer';
import { RequestNameRow } from './molecules/RequestNameRow';
import { RequestMethodRow } from './molecules/RequestMethodRow';

interface RequestEditorPanelProps {
  requestNameForSave: string;
  onRequestNameForSaveChange: (name: string) => void;
  method: string;
  onMethodChange: (method: string) => void;
  url: string;
  onUrlChange: (url: string) => void;
  initialBody?: KeyValuePair[];
  activeRequestId: string | null;
  loading: boolean;
  onSaveRequest: () => void;
  onSendRequest: () => void;
  onBodyPairsChange: (pairs: KeyValuePair[]) => void;
  headers: RequestHeader[];
  onAddHeader: () => void;
  onUpdateHeader: (id: string, field: 'key' | 'value' | 'enabled', value: string | boolean) => void;
  onRemoveHeader: (id: string) => void;
}

export const RequestEditorPanel = forwardRef<RequestEditorPanelRef, RequestEditorPanelProps>(
  (
    {
      requestNameForSave,
      onRequestNameForSaveChange,
      method,
      onMethodChange,
      url,
      onUrlChange,
      initialBody,
      activeRequestId,
      loading,
      onSaveRequest,
      onSendRequest,
      onBodyPairsChange,
      headers,
      onAddHeader,
      onUpdateHeader,
      onRemoveHeader,
    },
    ref,
  ) => {
    const bodyEditorRef = useRef<BodyEditorKeyValueRef>(null);

    useImperativeHandle(ref, () => ({
      getRequestBodyAsJson: () => {
        return bodyEditorRef.current?.getCurrentBodyAsJson() || '';
      },
      getBody: () => {
        return bodyEditorRef.current?.getCurrentKeyValuePairs() || [];
      },
    }));

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          border: '1px solid #ccc',
          padding: '15px',
          borderRadius: '5px',
        }}
      >
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
          <ScrollableContainer height={300}>
            <BodyEditorKeyValue
              ref={bodyEditorRef}
              initialBody={initialBody}
              method={method}
              onChange={onBodyPairsChange}
            />
          </ScrollableContainer>
        </div>
      </div>
    );
  },
);

RequestEditorPanel.displayName = 'RequestEditorPanel';
