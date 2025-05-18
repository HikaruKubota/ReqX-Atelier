import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Heading } from './atoms/Heading';
import { JsonPre } from './atoms/JsonPre';
import { ErrorAlert } from './molecules/ErrorAlert';
import { ErrorInfo } from '../types';

interface ResponseDisplayPanelProps {
  response: unknown;
  error: ErrorInfo | null;
  loading: boolean;
}

export const ResponseDisplayPanel: React.FC<ResponseDisplayPanelProps> = ({
  response,
  error,
  loading,
}) => {
  const { t } = useTranslation();
  return (
    <>
      <Heading level={2} className="text-xl font-bold">
        {t('response_heading')}
      </Heading>
      <ErrorAlert error={error} />
      {response && (
        <JsonPre
          data={response}
          className="bg-green-50 dark:bg-green-900 p-4 whitespace-pre-wrap break-words rounded border border-green-200 dark:border-green-700 dark:text-green-100"
        />
      )}
      {!response && !error && !loading && (
        <p className="text-gray-500">{t('no_response')}</p>
      )}
      {loading && <p className="text-gray-500">{t('loading')}</p>}
    </>
  );
};
