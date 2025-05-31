import React, { forwardRef } from 'react';
import { BodyEditorKeyValue } from './BodyEditorKeyValue';
import type { KeyValuePair, BodyEditorKeyValueRef } from '../types';

interface ParamsEditorKeyValueProps {
  value?: KeyValuePair[];
  initialParams?: KeyValuePair[]; // Deprecated: use value instead
  onChange?: (pairs: KeyValuePair[]) => void;
  containerHeight?: number | string;
  activeRequestId?: string | null;
}

export const ParamsEditorKeyValue = forwardRef<BodyEditorKeyValueRef, ParamsEditorKeyValueProps>(
  ({ value, initialParams, onChange, containerHeight = 300, activeRequestId }, ref) => (
    <BodyEditorKeyValue
      ref={ref}
      value={value || initialParams}
      method="POST"
      onChange={onChange}
      containerHeight={containerHeight}
      addRowLabelKey="add_param_row"
      activeRequestId={activeRequestId}
    />
  ),
);

ParamsEditorKeyValue.displayName = 'ParamsEditorKeyValue';
