import * as React from 'react';
import { Heading } from './atoms/Heading';
import { JsonPre } from './atoms/JsonPre';
import { ErrorAlert } from './molecules/ErrorAlert';

interface ResponseDisplayPanelProps {
  response: any;
  error: any;
  loading: boolean;
}

export const ResponseDisplayPanel: React.FC<ResponseDisplayPanelProps> = ({
  response,
  error,
  loading,
}) => {
  return (
    <>
      <Heading level={2} className="text-xl font-bold">Response</Heading>
      <ErrorAlert error={error} />
      {response && (
        <JsonPre
          data={response}
          className="bg-green-50 p-4 whitespace-pre-wrap break-words rounded border border-green-200"
        />
      )}
      {!response && !error && !loading && (
        <p className="text-gray-500">No response yet. Send a request or load a saved one!</p>
      )}
      {loading && <p className="text-gray-500">Loading...</p>}
    </>
  );
};
