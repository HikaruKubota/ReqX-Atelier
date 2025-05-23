import React from 'react';
import clsx from 'clsx';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

// Forward ref so parent components can control focus etc.
export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, ...rest }, ref) => (
    <input
      ref={ref}
      className={clsx('p-2 border border-gray-300 rounded', className)}
      {...rest}
    />
  ),
);

TextInput.displayName = 'TextInput';

export default TextInput;
