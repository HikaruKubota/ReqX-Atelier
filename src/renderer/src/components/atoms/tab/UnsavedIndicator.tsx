import React from 'react';
import clsx from 'clsx';

export type UnsavedIndicatorProps = React.HTMLAttributes<HTMLSpanElement>;

export const UnsavedIndicator: React.FC<UnsavedIndicatorProps> = ({ className, ...rest }) => (
  <span className={clsx('inline-block w-2 h-2 bg-red-500 rounded-full', className)} {...rest} />
);

export default UnsavedIndicator;
