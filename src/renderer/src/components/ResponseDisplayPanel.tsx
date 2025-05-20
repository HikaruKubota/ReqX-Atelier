import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Heading } from './atoms/Heading';
import { JsonPre } from './atoms/JsonPre';
import { ErrorAlert } from './molecules/ErrorAlert';
import { ErrorInfo } from '../types';
import { CopyButton } from './atoms/button/CopyButton';
import { Toast } from './atoms/toast/Toast';

interface ResponseDisplayPanelProps {
  response: unknown;
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

  const handleCopyResponse = React.useCallback(async () => {
    if (!response) return;
    await navigator.clipboard.writeText(JSON.stringify(response, null, 2));
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
        {response ? <CopyButton onClick={handleCopyResponse} /> : null}
      </div>
      {responseTime !== null && (
        <p className="text-gray-500">{t('response_time', { time: responseTime })}</p>
      )}
      <ErrorAlert error={error} onCopy={handleCopyError} />
      {response && (
        <JsonPre
          data={response}
          className="bg-green-50 dark:bg-green-900 p-4 whitespace-pre-wrap break-words rounded border border-green-200 dark:border-green-700 dark:text-green-100"
        />
      )}
      {!response && !error && !loading && <p className="text-gray-500">{t('no_response')}</p>}
      {loading && <p className="text-gray-500">{t('loading')}</p>}
      <Toast
        message={t('copy_success')}
        isOpen={copyToastOpen}
        onClose={() => setCopyToastOpen(false)}
      />
    </>
  );
};
