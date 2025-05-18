import React from 'react';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const Heading: React.FC<HeadingProps> = ({ level = 2, children, className, ...rest }) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return (
    <Tag className={className} {...rest}>
      {children}
    </Tag>
  );
};

export default Heading;
