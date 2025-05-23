import React, { useState, useEffect } from 'react';
import { Modal } from './atoms/Modal';
import { TextInput } from './atoms/form/TextInput';
import { useTranslation } from 'react-i18next';

interface RenameFolderModalProps {
  isOpen: boolean;
  initialName: string;
  onSave: (name: string) => void;
  onClose: () => void;
}

export const RenameFolderModal: React.FC<RenameFolderModalProps> = ({
  isOpen,
  initialName,
  onSave,
  onClose,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState(initialName);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <h2 className="text-lg mb-2">{t('rename_folder')}</h2>
      <div className="mb-4">
        <TextInput
          autoFocus
          value={name}
          placeholder={t('folder_name_prompt')}
          onChange={(e) => setName(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onClose}>{t('cancel')}</button>
        <button
          onClick={() => {
            onSave(name);
          }}
        >
          {t('rename')}
        </button>
      </div>
    </Modal>
  );
};

export default RenameFolderModal;
