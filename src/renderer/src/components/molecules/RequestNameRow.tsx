import React from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput } from '../atoms/form/TextInput';
import { SaveRequestButton } from '../atoms/button/SaveRequestButton';

interface RequestNameRowProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  saving: boolean;
  isUpdate: boolean;
}

export const RequestNameRow: React.FC<RequestNameRowProps> = ({
  value,
  onChange,
  onSave,
  saving,
  isUpdate,
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2">
      <TextInput
        type="text"
        placeholder={t('request_name_placeholder')}
        value={value}
        onChange={onChange}
        className="flex-grow"
      />
      <SaveRequestButton onClick={onSave} disabled={saving} isUpdate={isUpdate} />
    </div>
  );
};

export default RequestNameRow;
