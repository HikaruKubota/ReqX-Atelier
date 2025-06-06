import React from 'react';
import { useTranslation } from 'react-i18next';

interface JsonImportButtonProps {
  onClick?: () => void;
  disabled?: boolean;
}

export const JsonImportButton: React.FC<JsonImportButtonProps> = ({ onClick, disabled }) => {
  const { t } = useTranslation();

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 text-sm bg-muted text-foreground rounded hover:bg-accent border border-border transition-colors disabled:opacity-50 disabled:pointer-events-none"
    >
      {t('import_json') || 'Import JSON'}
    </button>
  );
};
