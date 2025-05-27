import React from 'react';
import { useTranslation } from 'react-i18next';

interface FolderInfoPanelProps {
  folderId: string;
  folderName: string;
}

export const FolderInfoPanel: React.FC<FolderInfoPanelProps> = ({ folderId, folderName }) => {
  const { t } = useTranslation();
  return (
    <div className="p-4 border border-gray-300 rounded">
      <p>
        {t('folder_id_label')}: {folderId}
      </p>
      <p>
        {t('folder_name_label')}: {folderName}
      </p>
    </div>
  );
};
