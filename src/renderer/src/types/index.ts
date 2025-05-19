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
}

export interface ErrorInfo {
  message?: string;
  [key: string]: unknown;
}

export interface ErrorAlertProps {
  error: ErrorInfo | null;
  className?: string;
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
  currentBodyKeyValuePairs: KeyValuePair[];
  setCurrentBodyKeyValuePairs: (pairs: KeyValuePair[]) => void;
  currentBodyKeyValuePairsRef: React.MutableRefObject<KeyValuePair[]>;
  requestBody: string;
  requestBodyRef: React.MutableRefObject<string>;
  loadBodyKeyValuePairs: (pairs: KeyValuePair[]) => void;
  resetBody: () => void;
}

export interface SavedRequest {
  id: string;
  name: string;
  method: string;
  url: string;
  headers?: RequestHeader[];
  bodyKeyValuePairs?: KeyValuePair[];
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
  executeRequest: (
    method: string,
    url: string,
    body?: string,
    headers?: Record<string, string>,
  ) => Promise<void>;
  resetApiResponse: () => void;
}

export interface RequestEditorPanelRef {
  getRequestBodyAsJson: () => string;
  getRequestBodyKeyValuePairs: () => KeyValuePair[];
}

export interface ThemeColors {
  background: string;
  text: string;
  primary: string;
  secondary: string;
}

export interface RequestEditorState
  extends Omit<UseHeadersManagerReturn, 'loadHeaders' | 'resetHeaders'>,
    Omit<UseBodyManagerReturn, 'loadBodyKeyValuePairs' | 'resetBody'> {
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
