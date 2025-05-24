import React from 'react';
import clsx from 'clsx';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const TextInput: React.FC<TextInputProps> = ({ className, ...rest }) => (
  <input className={clsx('p-2 border border-gray-300 rounded', className)} {...rest} />
);

export default TextInput;
