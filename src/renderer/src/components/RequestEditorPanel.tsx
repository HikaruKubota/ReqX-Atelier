import React, { useImperativeHandle, forwardRef, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  RequestHeader,
  BodyEditorKeyValueRef,
  KeyValuePair,
  RequestEditorPanelRef,
} from '../types';
import { HeadersEditor } from './HeadersEditor';
import { BodyEditorKeyValue } from './BodyEditorKeyValue';
import { ParamsEditorKeyValue } from './ParamsEditorKeyValue';
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
  initialParams?: KeyValuePair[];
  activeRequestId: string | null;
  loading: boolean;
  onSaveRequest: () => void;
  onSendRequest: () => void;
  onBodyPairsChange: (pairs: KeyValuePair[]) => void;
  onParamPairsChange: (pairs: KeyValuePair[]) => void;
  headers: RequestHeader[];
  onAddHeader: () => void;
  onUpdateHeader: (id: string, field: 'key' | 'value' | 'enabled', value: string | boolean) => void;
  onRemoveHeader: (id: string) => void;
  onReorderHeaders: (newHeaders: RequestHeader[]) => void;
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
      initialParams,
      activeRequestId,
      loading,
      onSaveRequest,
      onSendRequest,
      onBodyPairsChange,
      onParamPairsChange,
      headers,
      onAddHeader,
      onUpdateHeader,
      onRemoveHeader,
      onReorderHeaders,
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const bodyEditorRef = useRef<BodyEditorKeyValueRef>(null);
    const paramsEditorRef = useRef<BodyEditorKeyValueRef>(null);

    useImperativeHandle(ref, () => ({
      getRequestBodyAsJson: () => {
        return bodyEditorRef.current?.getCurrentBodyAsJson() || '';
      },
      getBody: () => {
        return bodyEditorRef.current?.getCurrentKeyValuePairs() || [];
      },
      getParams: () => {
        return paramsEditorRef.current?.getCurrentKeyValuePairs() || [];
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
          onReorderHeaders={onReorderHeaders}
        />

        {method === 'GET' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <h4>{t('request_params_heading')}</h4>
            <ParamsEditorKeyValue
              ref={paramsEditorRef}
              initialParams={initialParams}
              method={method}
              onChange={onParamPairsChange}
              containerHeight={150}
            />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <h4>{t('request_body_heading')}</h4>
          <BodyEditorKeyValue
            ref={bodyEditorRef}
            initialBody={initialBody}
            method={method}
            onChange={onBodyPairsChange}
            containerHeight={300}
          />
        </div>
      </div>
    );
  },
);

RequestEditorPanel.displayName = 'RequestEditorPanel';
