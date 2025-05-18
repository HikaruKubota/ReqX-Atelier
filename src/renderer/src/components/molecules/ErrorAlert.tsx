import clsx from 'clsx';
import { JsonPre } from '../atoms/JsonPre';

interface ErrorAlertProps {
  error: unknown;
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, className }) => {
  if (!error) return null;
  return (
    <div className={clsx('border-2 border-red-500 bg-red-50 p-4 my-2 rounded', className)}>
      <h3 className="text-red-700 mt-0">Error Details:</h3>
      {typeof error === 'object' && error && 'message' in error && (
        <p className="font-bold text-red-600">{(error as { message: string }).message}</p>
      )}
      <JsonPre
        data={error}
        className="bg-pink-50 text-pink-700 p-2 mt-2 whitespace-pre-wrap break-words rounded"
      />
    </div>
  );
};

export default ErrorAlert;
