import React from 'react';

export interface KeyValuePair {
  id: string;
  keyName: string;
  value: string;
  enabled: boolean;
}

export interface BodyEditorKeyValueRef {
  getCurrentBodyAsJson: () => string;
  getCurrentKeyValuePairs: () => KeyValuePair[];
  importFromJson: (json: string) => boolean;
  triggerDrag?: (activeId: string, overId: string) => void;
}

export interface ErrorInfo {
  message?: string;
  [key: string]: unknown;
}

export interface ErrorAlertProps {
  error: ErrorInfo | null;
  className?: string;
  onCopy?: () => void;
}

export interface RequestHeader {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface UseHeadersManagerReturn {
  headers: RequestHeader[];
  setHeaders: (newHeaders: RequestHeader[]) => void;
  headersRef: React.MutableRefObject<RequestHeader[]>;
  addHeader: () => void;
  updateHeader: (
    id: string,
    field: keyof Omit<RequestHeader, 'id'>,
    value: string | boolean,
  ) => void;
  removeHeader: (id: string) => void;
  loadHeaders: (loadedHeaders: RequestHeader[]) => void;
  resetHeaders: () => void;
}

export interface UseBodyManagerReturn {
  body: KeyValuePair[];
  setBody: (pairs: KeyValuePair[]) => void;
  bodyRef: React.MutableRefObject<KeyValuePair[]>;
  requestBody: string;
  requestBodyRef: React.MutableRefObject<string>;
  loadBody: (pairs: KeyValuePair[]) => void;
  resetBody: () => void;
}

export interface UseParamsManagerReturn {
  params: KeyValuePair[];
  setParams: (pairs: KeyValuePair[]) => void;
  paramsRef: React.MutableRefObject<KeyValuePair[]>;
  queryString: string;
  queryStringRef: React.MutableRefObject<string>;
  loadParams: (pairs: KeyValuePair[]) => void;
  resetParams: () => void;
}

export interface SavedRequest {
  id: string;
  name: string;
  method: string;
  url: string;
  headers?: RequestHeader[];
  body?: KeyValuePair[];
  params?: KeyValuePair[];
}

export interface SavedFolder {
  id: string;
  name: string;
  parentFolderId: string | null;
  requestIds: string[];
  subFolderIds: string[];
}

export interface ApiResult {
  isError?: boolean;
  status?: number;
  data?: unknown;
  headers?: Record<string, unknown>;
  message?: string;
  responseData?: unknown;
}

export interface ApiError {
  message: string;
  [key: string]: unknown;
}

export interface ApiResponseHandler {
  response: ApiResult | null;
  error: ApiError | null;
  loading: boolean;
  responseTime: number | null;
  executeRequest: (
    method: string,
    url: string,
    body?: string,
    headers?: Record<string, string>,
  ) => Promise<void>;
  resetApiResponse: () => void;
  setApiResponseState: (state: {
    response: ApiResult | null;
    error: ApiError | null;
    responseTime: number | null;
  }) => void;
}

export interface RequestEditorPanelRef {
  getRequestBodyAsJson: () => string;
  getBody: () => KeyValuePair[];
  getParams: () => KeyValuePair[];
}

export interface ThemeColors {
  background: string;
  text: string;
  primary: string;
  secondary: string;
}

export interface RequestEditorState
  extends Omit<UseHeadersManagerReturn, 'loadHeaders' | 'resetHeaders'>,
    Omit<UseBodyManagerReturn, 'loadBody' | 'resetBody'>,
    Omit<UseParamsManagerReturn, 'loadParams' | 'resetParams'> {
  method: string;
  setMethod: (method: string) => void;
  methodRef: { current: string };
  url: string;
  setUrl: (url: string) => void;
  urlRef: { current: string };
  requestNameForSave: string;
  setRequestNameForSave: (name: string) => void;
  requestNameForSaveRef: { current: string };
  activeRequestId: string | null;
  setActiveRequestId: (id: string | null) => void;
  activeRequestIdRef: { current: string | null };
  loadRequest: (request: SavedRequest) => void;
  resetEditor: () => void;
}
