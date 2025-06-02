import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeProvider';
import { SelectBox } from './atoms/form/SelectBox';

export const ThemeToggleButton: React.FC = () => {
  const { theme, setTheme, availableThemes } = useTheme();
  const { t } = useTranslation();
  
  return (
    <SelectBox
      value={theme.name}
      onChange={(e) => setTheme(e.target.value)}
      className="w-32"
    >
      {availableThemes.map((themeName) => (
        <option key={themeName} value={themeName}>
          {t(`theme_${themeName}`, { defaultValue: themeName })}
        </option>
      ))}
    </SelectBox>
  );
};
