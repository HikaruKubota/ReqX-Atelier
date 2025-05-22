import React from 'react';
import { useTranslation } from 'react-i18next';
import { SelectBox } from '../atoms/form/SelectBox';
import { TextInput } from '../atoms/form/TextInput';
import { SendButton } from '../atoms/button/SendButton';

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

interface RequestMethodRowProps {
  method: string;
  onMethodChange: (method: string) => void;
  url: string;
  onUrlChange: (url: string) => void;
  loading: boolean;
  onSend: () => void;
}

export const RequestMethodRow: React.FC<RequestMethodRowProps> = ({
  method,
  onMethodChange,
  url,
  onUrlChange,
  loading,
  onSend,
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2">
      <SelectBox value={method} onChange={(e) => onMethodChange(e.target.value)}>
        {METHODS.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </SelectBox>
      <TextInput
        type="text"
        placeholder={t('request_url_placeholder')}
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        className="flex-grow"
      />
      <SendButton onClick={onSend} disabled={loading} loading={loading} />
    </div>
  );
};

export default RequestMethodRow;
