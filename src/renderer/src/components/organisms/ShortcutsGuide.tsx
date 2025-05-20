import React from 'react';
import { Heading } from '../atoms/Heading';
import { NewRequestButton } from '../atoms/button/NewRequestButton';
import { useTranslation } from 'react-i18next';

interface ShortcutsGuideProps {
  onNew: () => void;
}

export const ShortcutsGuide: React.FC<ShortcutsGuideProps> = ({ onNew }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center h-full">
      <Heading level={2} className="text-xl font-bold">
        {t('cheatsheet_title')}
      </Heading>
      <p>{t('no_tabs')}</p>
      <ul className="list-disc text-left">
        <li>{t('shortcut_new')}</li>
        <li>{t('shortcut_send')}</li>
        <li>{t('shortcut_save')}</li>
        <li>{t('shortcut_close_tab')}</li>
        <li>{t('shortcut_next_tab')}</li>
        <li>{t('shortcut_prev_tab')}</li>
        <li>{t('shortcut_move_tab_right')}</li>
        <li>{t('shortcut_move_tab_left')}</li>
      </ul>
      <NewRequestButton onClick={onNew} />
    </div>
  );
};
