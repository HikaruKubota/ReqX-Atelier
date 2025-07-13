import React from 'react';
import { RequestCollectionSidebar } from '../components/RequestCollectionSidebar';
import { RequestEditorPanel } from '../components/RequestEditorPanel';
import { ResponseDisplayPanel } from '../components/ResponseDisplayPanel';
import { ShortcutsGuide } from '../components/organisms/ShortcutsGuide';
import { ThemeToggleButton } from '../components/ThemeToggleButton';
import { EnvironmentSelector } from '../components/EnvironmentSelector';
import { VariablesButton } from '../components/VariablesButton';
import { Toast } from '../components/atoms/toast/Toast';
import { VariablesPanel } from '../components/VariablesPanel';
import type {
  SavedRequest,
  SavedFolder,
  ApiResult,
  ApiError,
  RequestEditorPanelRef,
  KeyValuePair,
  RequestHeader,
  VariableExtraction,
} from '../types';
import { useTranslation } from 'react-i18next';

interface AppLayoutProps {
  // Sidebar props
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  savedRequests: SavedRequest[];
  savedFolders: SavedFolder[];
  activeRequestId: string | null;
  onLoadRequest: (request: SavedRequest) => void;
  onDeleteRequest: (id: string) => void;
  onCopyRequest: (id: string) => void;
  onAddFolder: (parentId?: string | null) => void;
  onAddRequest: (parentId?: string | null) => void;
  onDeleteFolder: (id: string) => void;
  onCopyFolder: (id: string) => void;
  moveRequest: (requestId: string, targetFolderId: string | null) => void;
  moveFolder: (folderId: string, targetFolderId: string | null) => void;

  // Tab bar content
  tabBarContent: React.ReactNode;
  hasActiveTabs: boolean;

  // Editor panel props
  editorPanelRef: React.RefObject<RequestEditorPanelRef>;
  requestNameForSave: string;
  onRequestNameForSaveChange: (name: string) => void;
  method: string;
  onMethodChange: (method: string) => void;
  url: string;
  onUrlChange: (url: string) => void;
  initialBody: KeyValuePair[];
  initialParams: KeyValuePair[];
  onBodyPairsChange: (pairs: KeyValuePair[]) => void;
  onParamPairsChange: (pairs: KeyValuePair[]) => void;
  loading: boolean;
  onSaveRequest: () => void;
  onSendRequest: () => void;
  headers: RequestHeader[];
  onAddHeader: () => void;
  onUpdateHeader: (id: string, field: 'key' | 'value' | 'enabled', value: string | boolean) => void;
  onRemoveHeader: (id: string) => void;
  onReorderHeaders: (headers: RequestHeader[]) => void;
  variableExtraction: VariableExtraction | undefined;
  onVariableExtractionChange: (extraction: VariableExtraction | undefined) => void;

  // Response panel props
  response: ApiResult | null;
  error: ApiError | null;
  responseTime: number | null;

  // Other props
  saveToastOpen: boolean;
  setSaveToastOpen: (open: boolean) => void;
  variablesPanelOpen: boolean;
  setVariablesPanelOpen: (open: boolean) => void;
  onNewRequest: () => void;
}

export function AppLayout({
  sidebarOpen,
  setSidebarOpen,
  savedRequests,
  savedFolders,
  activeRequestId,
  onLoadRequest,
  onDeleteRequest,
  onCopyRequest,
  onAddFolder,
  onAddRequest,
  onDeleteFolder,
  onCopyFolder,
  moveRequest,
  moveFolder,
  tabBarContent,
  hasActiveTabs,
  editorPanelRef,
  requestNameForSave,
  onRequestNameForSaveChange,
  method,
  onMethodChange,
  url,
  onUrlChange,
  initialBody,
  initialParams,
  onBodyPairsChange,
  onParamPairsChange,
  loading,
  onSaveRequest,
  onSendRequest,
  headers,
  onAddHeader,
  onUpdateHeader,
  onRemoveHeader,
  onReorderHeaders,
  variableExtraction,
  onVariableExtractionChange,
  response,
  error,
  responseTime,
  saveToastOpen,
  setSaveToastOpen,
  variablesPanelOpen,
  setVariablesPanelOpen,
  onNewRequest,
}: AppLayoutProps) {
  const { t } = useTranslation();

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <RequestCollectionSidebar
        savedRequests={savedRequests}
        savedFolders={savedFolders}
        activeRequestId={activeRequestId}
        onLoadRequest={onLoadRequest}
        onDeleteRequest={onDeleteRequest}
        onCopyRequest={onCopyRequest}
        onAddFolder={onAddFolder}
        onAddRequest={onAddRequest}
        onDeleteFolder={onDeleteFolder}
        onCopyFolder={onCopyFolder}
        moveRequest={moveRequest}
        moveFolder={moveFolder}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {tabBarContent}
        <div
          style={{
            flexGrow: 1,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            overflowY: 'auto',
          }}
        >
          <div style={{ alignSelf: 'flex-end', display: 'flex', gap: '10px' }}>
            <EnvironmentSelector />
            <VariablesButton onClick={() => setVariablesPanelOpen(true)} />
            <ThemeToggleButton />
          </div>
          {!hasActiveTabs ? (
            <ShortcutsGuide onNew={onNewRequest} />
          ) : (
            <>
              <RequestEditorPanel
                ref={editorPanelRef}
                requestNameForSave={requestNameForSave}
                onRequestNameForSaveChange={onRequestNameForSaveChange}
                method={method}
                onMethodChange={onMethodChange}
                url={url}
                onUrlChange={onUrlChange}
                initialBody={initialBody}
                initialParams={initialParams}
                onBodyPairsChange={onBodyPairsChange}
                onParamPairsChange={onParamPairsChange}
                activeRequestId={activeRequestId}
                loading={loading}
                onSaveRequest={onSaveRequest}
                onSendRequest={onSendRequest}
                headers={headers}
                onAddHeader={onAddHeader}
                onUpdateHeader={onUpdateHeader}
                onRemoveHeader={onRemoveHeader}
                onReorderHeaders={onReorderHeaders}
                variableExtraction={variableExtraction}
                onVariableExtractionChange={onVariableExtractionChange}
              />

              <ResponseDisplayPanel
                response={response}
                error={error}
                loading={loading}
                responseTime={responseTime}
              />
            </>
          )}
        </div>
      </div>
      <Toast
        message={t('save_success')}
        isOpen={saveToastOpen}
        onClose={() => setSaveToastOpen(false)}
      />
      <VariablesPanel isOpen={variablesPanelOpen} onClose={() => setVariablesPanelOpen(false)} />
    </div>
  );
}
