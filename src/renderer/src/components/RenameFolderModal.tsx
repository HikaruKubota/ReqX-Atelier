import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  useLayoutEffect(() => {
    if (isOpen) {
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <form
        data-testid="rename-folder-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(name);
        }}
      >
        <h2 className="text-lg mb-2">{t('rename_folder')}</h2>
        <div className="mb-4">
          <TextInput
            ref={inputRef}
            value={name}
            placeholder={t('folder_name_prompt')}
            onChange={(e) => setName(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose}>
            {t('cancel')}
          </button>
          <button type="submit">{t('rename')}</button>
        </div>
      </form>
    </Modal>
  );
};

export default RenameFolderModal;
