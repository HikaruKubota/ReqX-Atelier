import React, { Fragment, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import clsx from 'clsx';

interface ToastProps {
  message: string;
  isOpen: boolean;
  duration?: number;
  onClose?: () => void;
  className?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  isOpen,
  duration = 3000,
  onClose,
  className,
  actionLabel,
  onAction,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    if (!duration) return;
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [isOpen, duration, onClose]);

  return (
    <Transition
      as={Fragment}
      show={isOpen}
      enter="ease-out duration-200"
      enterFrom="opacity-0 translate-y-2"
      enterTo="opacity-100 translate-y-0"
      leave="ease-in duration-150"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 translate-y-2"
      unmount
    >
      <div
        className={clsx(
          'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow',
          className,
        )}
      >
        <span>{message}</span>
        {actionLabel && onAction && (
          <button className="ml-4 underline font-bold" onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
    </Transition>
  );
};

export default Toast;
