export interface ElectronAPI {
  sendApiRequest: (options: {
    method: string;
    url: string;
    data?: unknown;
    headers?: Record<string, string>;
  }) => Promise<import('./renderer/src/types').ApiResult>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
