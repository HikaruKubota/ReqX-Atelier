import React, { forwardRef } from 'react';
import { BodyEditorKeyValue } from './BodyEditorKeyValue';
import type { BodyEditorKeyValueRef, KeyValuePair } from '../types';

export interface ParamsEditorKeyValueProps {
  initialParams?: KeyValuePair[];
  onChange?: (pairs: KeyValuePair[]) => void;
  containerHeight?: number | string;
  method: string;
}

export const ParamsEditorKeyValue = forwardRef<BodyEditorKeyValueRef, ParamsEditorKeyValueProps>(
  ({ initialParams, onChange, containerHeight = 150, method }, ref) => (
    <BodyEditorKeyValue
      ref={ref}
      initialBody={initialParams}
      onChange={onChange}
      containerHeight={containerHeight}
      method={method}
      editorType="params"
    />
  ),
);

ParamsEditorKeyValue.displayName = 'ParamsEditorKeyValue';
