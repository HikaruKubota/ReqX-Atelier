import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeProvider';

export const ThemeToggleButton: React.FC = () => {
  const { mode, toggleMode } = useTheme();
  const { t } = useTranslation();
  return (
    <button className="btn btn-sm" onClick={toggleMode}>
      {mode === 'light' ? t('switch_to_dark') : t('switch_to_light')}
    </button>
  );
};
