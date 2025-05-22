import React from 'react';

interface ScrollableContainerProps {
  children: React.ReactNode;
  height?: number | string;
  className?: string;
}

export const ScrollableContainer: React.FC<ScrollableContainerProps> = ({
  children,
  height = 300,
  className,
}) => {
  const styleHeight = typeof height === 'number' ? `${height}px` : height;
  return (
    <div className={`overflow-y-auto ${className ?? ''}`} style={{ maxHeight: styleHeight }}>
      {children}
    </div>
  );
};
