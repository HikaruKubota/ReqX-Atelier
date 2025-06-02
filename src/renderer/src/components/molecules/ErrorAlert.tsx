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
        'border-2 border-destructive bg-destructive/10 p-4 my-2 rounded',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-destructive mt-0">{t('error_details')}</h3>
        {onCopy && <CopyButton size="sm" variant="ghost" onClick={onCopy} labelKey="copy_error" />}
      </div>
      {error.message && <p className="font-bold text-destructive">{error.message}</p>}
      <JsonPre
        data={error}
        className="bg-destructive/5 text-destructive p-2 mt-2 whitespace-pre-wrap break-words rounded"
      />
    </div>
  );
};

export default ErrorAlert;
