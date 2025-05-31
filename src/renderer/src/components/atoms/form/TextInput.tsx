import React from 'react';
import { UnifiedInput, UnifiedInputProps } from './UnifiedInput';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TextInputProps extends Omit<UnifiedInputProps, 'enableVariables'> {}

/**
 * TextInput component for backward compatibility.
 * @deprecated Use UnifiedInput directly for new components
 */
export const TextInput: React.FC<TextInputProps> = ({
  value = '',
  onChange = () => {},
  ...rest
}) => <UnifiedInput value={value} onChange={onChange} enableVariables={false} {...rest} />;

export default TextInput;
