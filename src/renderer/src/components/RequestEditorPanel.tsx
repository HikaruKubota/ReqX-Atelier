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
import { TabButton } from './atoms/button/TabButton';
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
    const [activeTab, setActiveTab] = React.useState<'headers' | 'body' | 'params'>('headers');

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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div className="flex gap-2 mb-2">
            <TabButton active={activeTab === 'headers'} onClick={() => setActiveTab('headers')}>
              {t('header_tab')}
            </TabButton>
            <TabButton active={activeTab === 'body'} onClick={() => setActiveTab('body')}>
              {t('body_tab')}
            </TabButton>
            <TabButton active={activeTab === 'params'} onClick={() => setActiveTab('params')}>
              {t('param_tab')}
            </TabButton>
          </div>
          <h4>
            {activeTab === 'headers'
              ? t('headers_heading')
              : activeTab === 'body'
                ? t('request_body_heading')
                : t('request_params_heading')}
          </h4>
          {activeTab === 'headers' ? (
            <HeadersEditor
              headers={headers}
              onAddHeader={onAddHeader}
              onUpdateHeader={onUpdateHeader}
              onRemoveHeader={onRemoveHeader}
              onReorderHeaders={onReorderHeaders}
            />
          ) : activeTab === 'body' ? (
            <BodyEditorKeyValue
              ref={bodyEditorRef}
              initialBody={initialBody}
              method={method}
              onChange={onBodyPairsChange}
              containerHeight={300}
            />
          ) : (
            <ParamsEditorKeyValue
              ref={paramsEditorRef}
              initialParams={initialParams}
              onChange={onParamPairsChange}
              containerHeight={300}
            />
          )}
        </div>
      </div>
    );
  },
);

RequestEditorPanel.displayName = 'RequestEditorPanel';
