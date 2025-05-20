import React from 'react';
import clsx from 'clsx';

interface ScrollableRowProps {
  children: React.ReactNode;
  className?: string;
}

export const ScrollableRow: React.FC<ScrollableRowProps> = ({ children, className }) => (
  <div className={clsx('overflow-x-auto whitespace-nowrap', className)}>{children}</div>
);

export default ScrollableRow;
