import React, { forwardRef } from 'react';
import { BodyEditorKeyValue } from './BodyEditorKeyValue';
import type { KeyValuePair, BodyEditorKeyValueRef } from '../types';

interface ParamsEditorKeyValueProps {
  initialParams?: KeyValuePair[];
  onChange?: (pairs: KeyValuePair[]) => void;
  containerHeight?: number | string;
}

export const ParamsEditorKeyValue = forwardRef<BodyEditorKeyValueRef, ParamsEditorKeyValueProps>(
  ({ initialParams, onChange, containerHeight = 300 }, ref) => (
    <BodyEditorKeyValue
      ref={ref}
      initialBody={initialParams}
      method="POST"
      onChange={onChange}
      containerHeight={containerHeight}
      addRowLabelKey="add_param_row"
    />
  ),
);

ParamsEditorKeyValue.displayName = 'ParamsEditorKeyValue';
