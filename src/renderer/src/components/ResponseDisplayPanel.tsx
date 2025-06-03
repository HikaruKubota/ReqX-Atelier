import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Heading } from './atoms/Heading';
import { JsonPre } from './atoms/JsonPre';
import { ErrorAlert } from './molecules/ErrorAlert';
import type { ApiResult, ErrorInfo } from '../types';
import { CopyButton } from './atoms/button/CopyButton';
import { Toast } from './atoms/toast/Toast';
import { TabButton } from './atoms/button/TabButton';

interface ResponseDisplayPanelProps {
  response: ApiResult | null;
  error: ErrorInfo | null;
  loading: boolean;
  responseTime: number | null;
}

export const ResponseDisplayPanel: React.FC<ResponseDisplayPanelProps> = ({
  response,
  error,
  loading,
  responseTime,
}) => {
  const { t } = useTranslation();
  const [copyToastOpen, setCopyToastOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'data' | 'headers'>('data');

  React.useEffect(() => {
    if (response) {
      setActiveTab('data');
    }
  }, [response]);

  const handleCopyResponse = React.useCallback(async () => {
    if (!response) return;
    const data = response.data ?? response;
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopyToastOpen(true);
  }, [response]);

  const handleCopyHeaders = React.useCallback(async () => {
    const headers = response?.headers;
    if (!headers) return;
    await navigator.clipboard.writeText(JSON.stringify(headers, null, 2));
    setCopyToastOpen(true);
  }, [response]);

  const handleCopyError = React.useCallback(async () => {
    if (!error) return;
    await navigator.clipboard.writeText(JSON.stringify(error, null, 2));
    setCopyToastOpen(true);
  }, [error]);
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading level={2} className="text-xl font-bold">
          {t('response_heading')}
        </Heading>
        {response && activeTab === 'data' && <CopyButton onClick={handleCopyResponse} />}
        {response && activeTab === 'headers' && response.headers && (
          <CopyButton onClick={handleCopyHeaders} labelKey="copy_headers" />
        )}
      </div>
      {responseTime !== null && (
        <p className="text-muted-foreground">{t('response_time', { time: responseTime })}</p>
      )}
      {response && (
        <div className="flex my-2">
          <TabButton active={activeTab === 'data'} onClick={() => setActiveTab('data')}>
            {t('data_tab')}
          </TabButton>
          <TabButton active={activeTab === 'headers'} onClick={() => setActiveTab('headers')}>
            {t('header_tab')}
          </TabButton>
        </div>
      )}
      <ErrorAlert error={error} onCopy={handleCopyError} />
      {response && activeTab === 'data' && (
        <JsonPre
          data={response.data ?? response}
          className="bg-green-100 p-4 whitespace-pre-wrap break-words rounded border border-green-300 text-green-900"
        />
      )}
      {response &&
        activeTab === 'headers' &&
        (response.headers ? (
          <JsonPre
            data={response.headers}
            className="bg-green-100 p-4 whitespace-pre-wrap break-words rounded border border-green-300 text-green-900"
          />
        ) : (
          <p className="text-muted-foreground">{t('no_headers')}</p>
        ))}
      {!response && !error && !loading && (
        <p className="text-muted-foreground">{t('no_response')}</p>
      )}
      {loading && <p className="text-muted-foreground">{t('loading')}</p>}
      <Toast
        message={t('copy_success')}
        isOpen={copyToastOpen}
        onClose={() => setCopyToastOpen(false)}
      />
    </>
  );
};
