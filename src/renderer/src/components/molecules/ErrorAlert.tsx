import React from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { JsonPre } from '../atoms/JsonPre';
import { ErrorAlertProps } from '../../types';
import { CopyButton } from '../atoms/button/CopyButton';

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, className, onCopy }) => {
  if (!error) return null;
  const { t } = useTranslation();
  return (
    <div
      className={clsx(
        'border-2 border-red-500 dark:border-red-700 bg-red-50 dark:bg-red-900 p-4 my-2 rounded',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-red-700 dark:text-red-300 mt-0">{t('error_details')}</h3>
        {onCopy && <CopyButton size="sm" variant="ghost" onClick={onCopy} labelKey="copy_error" />}
      </div>
      {error.message && <p className="font-bold text-red-600">{error.message}</p>}
      <JsonPre
        data={error}
        className="bg-pink-50 dark:bg-pink-900 text-pink-700 dark:text-pink-200 p-2 mt-2 whitespace-pre-wrap break-words rounded"
      />
    </div>
  );
};

export default ErrorAlert;
