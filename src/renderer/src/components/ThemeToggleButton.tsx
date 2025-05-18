import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeProvider';
import { BaseButton } from './atoms/button/BaseButton';

export const ThemeToggleButton: React.FC = () => {
  const { mode, toggleMode } = useTheme();
  const { t } = useTranslation();
  return (
    <BaseButton size="sm" onClick={toggleMode}>
      {mode === 'light' ? t('switch_to_dark') : t('switch_to_light')}
    </BaseButton>
  );
};
