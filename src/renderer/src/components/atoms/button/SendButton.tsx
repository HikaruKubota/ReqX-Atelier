import React from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

export interface SendButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export const SendButton: React.FC<SendButtonProps> = ({ loading, className, ...props }) => {
  const { t } = useTranslation();
  return (
    <button
      className={clsx(
        'px-4 py-2 font-semibold rounded-md transition-all duration-200',
        'bg-primary text-primary-foreground',
        'hover:bg-primary/90 hover:shadow-md',
        'active:bg-primary/80 active:scale-95',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        className,
      )}
      {...props}
    >
      {loading ? t('sending') : t('send')}
    </button>
  );
};

export default SendButton;
