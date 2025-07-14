import React from 'react';
import { BaseButton } from './BaseButton';

interface CurlImportButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export const CurlImportButton: React.FC<CurlImportButtonProps> = ({
  onClick,
  disabled = false,
  className = '',
}) => {
  return (
    <BaseButton
      onClick={onClick}
      disabled={disabled}
      variant="secondary"
      size="sm"
      className={`flex items-center gap-2 ${className}`}
      title="Import from cURL command"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7,10 12,15 17,10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Import cURL
    </BaseButton>
  );
};
