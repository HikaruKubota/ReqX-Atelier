import React from 'react';
import clsx from 'clsx';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SelectBoxProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const SelectBox: React.FC<SelectBoxProps> = ({ className, children, ...rest }) => (
  <select className={clsx('p-2 border border-gray-300 rounded', className)} {...rest}>
    {children}
  </select>
);

export default SelectBox;
