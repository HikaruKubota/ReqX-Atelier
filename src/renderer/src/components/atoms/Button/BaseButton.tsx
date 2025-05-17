import React from 'react';
import clsx from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface BaseButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const BaseButton: React.FC<BaseButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}) => (
  <button
    className={clsx(
      'btn',
      `btn-${variant}`,
      `btn-${size}`,
      className // 追加クラスも上書き可能
    )}
    {...rest}
  >
    {children}
  </button>
);

export default BaseButton;
