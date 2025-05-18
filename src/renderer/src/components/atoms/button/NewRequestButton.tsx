import { FiPlus } from 'react-icons/fi';
import clsx from 'clsx';
import { BaseButton, BaseButtonProps } from './BaseButton';

export const NewRequestButton: React.FC<BaseButtonProps> = ({
  size = 'md',
  variant = 'primary',
  className,
  ...props
}) => (
  <BaseButton
    size={size}
    variant={variant}
    className={clsx(
      'flex items-center gap-2 px-4 py-2 rounded-md font-semibold shadow-sm transition-colors',
      'bg-blue-500 text-white hover:bg-blue-600',
      className,
    )}
    aria-label="New Request"
    {...props}
  >
    <FiPlus size={18} />
    <span>New Request</span>
  </BaseButton>
);
