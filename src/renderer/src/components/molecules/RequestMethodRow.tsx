import React from 'react';
import { useTranslation } from 'react-i18next';
import { SelectBox } from '../atoms/form/SelectBox';
import { SendButton } from '../atoms/button/SendButton';
import { UnifiedInput } from '../atoms/form/UnifiedInput';

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
    <div className="flex items-center gap-2 mb-6">
      <SelectBox value={method} onChange={(e) => onMethodChange(e.target.value)}>
        {METHODS.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </SelectBox>
      <UnifiedInput
        value={url}
        onChange={onUrlChange}
        placeholder={t('request_url_placeholder')}
        className="flex-grow"
        enableVariables={true}
        variant="compact"
      />
      <SendButton onClick={onSend} disabled={loading} loading={loading} />
    </div>
  );
};

export default RequestMethodRow;
