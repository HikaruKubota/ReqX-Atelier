import clsx from 'clsx';
import { BaseButton, BaseButtonProps } from './BaseButton.tsx';

export const EnableAllButton: React.FC<BaseButtonProps> = ({
  size = 'md',
  variant = 'primary',
  className,
  children,
  ...props
}) => (
  <BaseButton
    size={size}
    variant={variant}
    className={clsx(
      'px-4 py-2 rounded-md font-semibold shadow-sm transition-colors',
      'bg-green-500 text-white hover:bg-green-600',
      className,
    )}
    aria-label="Enable All"
    {...props}
  >
    {children ?? 'Enable All'}
  </BaseButton>
);

export default EnableAllButton;
