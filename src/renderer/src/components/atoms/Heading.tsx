import React, { JSX } from 'react';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const Heading: React.FC<HeadingProps> = ({ level = 2, children, className, ...rest }) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return React.createElement(
    Tag,
    { className, ...rest },
    children
  );
};

export default Heading;
