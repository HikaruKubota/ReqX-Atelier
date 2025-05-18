import clsx from 'clsx';
import { BaseButton, BaseButtonProps } from './BaseButton.tsx';

export const DisableAllButton: React.FC<BaseButtonProps> = ({
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
      'bg-red-500 text-white hover:bg-red-600',
      className,
    )}
    aria-label="Disable All"
    {...props}
  >
    {children ?? 'Disable All'}
  </BaseButton>
);

export default DisableAllButton;
