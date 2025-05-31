import React, { useImperativeHandle, forwardRef, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  RequestHeader,
  BodyEditorKeyValueRef,
  KeyValuePair,
  RequestEditorPanelRef,
  VariableExtraction,
} from '../types';
import { HeadersEditor } from './HeadersEditor';
import { BodyEditorKeyValue } from './BodyEditorKeyValue';
import { ParamsEditorKeyValue } from './ParamsEditorKeyValue';
import { VariableExtractionEditor } from './VariableExtractionEditor';
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
  variableExtraction?: VariableExtraction;
  onVariableExtractionChange?: (variableExtraction: VariableExtraction) => void;
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
      variableExtraction,
      onVariableExtractionChange,
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const bodyEditorRef = useRef<BodyEditorKeyValueRef>(null);
    const paramsEditorRef = useRef<BodyEditorKeyValueRef>(null);
    const [activeTab, setActiveTab] = React.useState<'headers' | 'body' | 'params' | 'tests'>(
      'headers',
    );

    useImperativeHandle(ref, () => ({
      getRequestBodyAsJson: () => {
        return bodyEditorRef.current?.getCurrentBodyAsJson() || '';
      },
      getBody: () => {
        // Return the controlled value directly from props
        return initialBody || [];
      },
      getParams: () => {
        // Return the controlled value directly from props
        return initialParams || [];
      },
    }));

    return (
      <div className="flex flex-col gap-4 border border-gray-300 p-4 rounded">
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

        <div className="flex flex-col gap-[5px]">
          <div className="flex gap-2 mb-2">
            <TabButton active={activeTab === 'params'} onClick={() => setActiveTab('params')}>
              {t('param_tab')}
            </TabButton>
            <TabButton active={activeTab === 'headers'} onClick={() => setActiveTab('headers')}>
              {t('header_tab')}
            </TabButton>
            <TabButton active={activeTab === 'body'} onClick={() => setActiveTab('body')}>
              {t('body_tab')}
            </TabButton>
            <TabButton active={activeTab === 'tests'} onClick={() => setActiveTab('tests')}>
              {t('tests_tab')}
            </TabButton>
          </div>
          {/* チラつきの抑制のためstyleにて表示切り替え対応 */}
          <div className={activeTab === 'headers' ? 'block' : 'hidden'}>
            <HeadersEditor
              headers={headers}
              onAddHeader={onAddHeader}
              onUpdateHeader={onUpdateHeader}
              onRemoveHeader={onRemoveHeader}
              onReorderHeaders={onReorderHeaders}
            />
          </div>
          {/* チラつきの抑制のためstyleにて表示切り替え対応 */}
          <div className={activeTab === 'body' ? 'block' : 'hidden'}>
            <BodyEditorKeyValue
              ref={bodyEditorRef}
              value={initialBody}
              method={method}
              onChange={onBodyPairsChange}
              containerHeight={300}
            />
          </div>
          {/* チラつきの抑制のためstyleにて表示切り替え対応 */}
          <div className={activeTab === 'params' ? 'block' : 'hidden'}>
            <ParamsEditorKeyValue
              ref={paramsEditorRef}
              value={initialParams}
              onChange={onParamPairsChange}
              containerHeight={300}
            />
          </div>
          {/* チラつきの抑制のためstyleにて表示切り替え対応 */}
          <div className={activeTab === 'tests' ? 'block' : 'hidden'}>
            {onVariableExtractionChange && (
              <VariableExtractionEditor
                variableExtraction={variableExtraction}
                onChange={onVariableExtractionChange}
              />
            )}
          </div>
        </div>
      </div>
    );
  },
);

RequestEditorPanel.displayName = 'RequestEditorPanel';
