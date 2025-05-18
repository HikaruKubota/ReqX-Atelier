import React from 'react';

export interface JsonPreProps {
  data: unknown;
  className?: string;
}

export const JsonPre: React.FC<JsonPreProps> = ({ data, className }) => (
  <pre className={className}>{JSON.stringify(data, null, 2)}</pre>
);

export default JsonPre;
