import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { ExtractionRule, VariableExtraction, ExtractionSource, VariableScope } from '../types';
import { TrashButton } from './atoms/button/TrashButton';
import { UnifiedInput } from './atoms/form/UnifiedInput';
import { SelectBox } from './atoms/form/SelectBox';

interface VariableExtractionEditorProps {
  variableExtraction?: VariableExtraction;
  onChange: (variableExtraction: VariableExtraction) => void;
}

export const VariableExtractionEditor: React.FC<VariableExtractionEditorProps> = ({
  variableExtraction,
  onChange,
}) => {
  const { t } = useTranslation();
  const [rules, setRules] = useState<ExtractionRule[]>(variableExtraction?.extractionRules || []);

  // Update rules when variableExtraction prop changes
  React.useEffect(() => {
    setRules(variableExtraction?.extractionRules || []);
  }, [variableExtraction]);

  const handleAddRule = useCallback(() => {
    const newRule: ExtractionRule = {
      id: `rule-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      source: 'body-json',
      path: '',
      variableName: '',
      scope: 'environment',
      enabled: true,
    };
    const updatedRules = [...rules, newRule];
    setRules(updatedRules);
    onChange({
      extractionRules: updatedRules,
      customScript: variableExtraction?.customScript || '',
      enabled: variableExtraction?.enabled ?? true,
    });
  }, [rules, onChange, variableExtraction]);

  const handleUpdateRule = useCallback(
    (id: string, updates: Partial<ExtractionRule>) => {
      const updatedRules = rules.map((rule) => (rule.id === id ? { ...rule, ...updates } : rule));
      setRules(updatedRules);
      onChange({
        extractionRules: updatedRules,
        customScript: variableExtraction?.customScript || '',
        enabled: variableExtraction?.enabled ?? true,
      });
    },
    [rules, onChange, variableExtraction],
  );

  const handleRemoveRule = useCallback(
    (id: string) => {
      const updatedRules = rules.filter((rule) => rule.id !== id);
      setRules(updatedRules);
      onChange({
        extractionRules: updatedRules,
        customScript: variableExtraction?.customScript || '',
        enabled: variableExtraction?.enabled ?? true,
      });
    },
    [rules, onChange, variableExtraction],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">
          {t('extract_variables') || 'Extract Variables'}
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          {t('extract_variables_desc') || 'Extract values from response and save as variables'}
        </p>

        {rules.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="text-xs text-muted-foreground font-medium">
              {t('variable_name') || 'Variable Name'}
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              {t('extract_from') || 'Extract From'}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {rules.map((rule) => (
            <ExtractionRuleRow
              key={rule.id}
              rule={rule}
              onUpdate={(updates) => handleUpdateRule(rule.id, updates)}
              onRemove={() => handleRemoveRule(rule.id)}
            />
          ))}
        </div>

        <button
          onClick={handleAddRule}
          className="mt-4 px-4 py-2 text-sm text-primary-foreground bg-primary rounded hover:bg-primary/90"
        >
          {t('add_extraction_rule') || '+ Add Extraction Rule'}
        </button>
      </div>
    </div>
  );
};

interface ExtractionRuleRowProps {
  rule: ExtractionRule;
  onUpdate: (updates: Partial<ExtractionRule>) => void;
  onRemove: () => void;
}

const ExtractionRuleRow: React.FC<ExtractionRuleRowProps> = ({ rule, onUpdate, onRemove }) => {
  const { t } = useTranslation();

  const sourceOptions = [
    { value: 'body-json', label: 'Response Body (JSON)' },
    { value: 'header', label: 'Response Header' },
  ];

  const scopeOptions = [
    { value: 'environment', label: 'Environment' },
    { value: 'global', label: 'Global' },
  ];

  return (
    <div className="p-3 bg-secondary rounded border border-border">
      <div className="grid grid-cols-[auto_1fr_auto] gap-3 items-center">
        <input
          type="checkbox"
          checked={rule.enabled}
          onChange={(e) => onUpdate({ enabled: e.target.checked })}
          className="w-4 h-4"
        />
        <div className="grid grid-cols-2 gap-2">
          <SelectBox
            value={rule.source}
            onChange={(e) => onUpdate({ source: e.target.value as ExtractionSource })}
            className="text-sm"
          >
            {sourceOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </SelectBox>
          <SelectBox
            value={rule.scope}
            onChange={(e) => onUpdate({ scope: e.target.value as VariableScope })}
            className="text-sm"
          >
            {scopeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </SelectBox>
          <UnifiedInput
            value={rule.variableName}
            onChange={(value) => onUpdate({ variableName: value })}
            placeholder="Variable name"
            disabled={!rule.enabled}
            variant="compact"
            className="text-sm"
          />
          <UnifiedInput
            value={rule.source === 'header' ? rule.headerName || '' : rule.path || ''}
            onChange={(value) => {
              if (rule.source === 'header') {
                onUpdate({ headerName: value, path: undefined });
              } else {
                onUpdate({ path: value, headerName: undefined });
              }
            }}
            placeholder={rule.source === 'header' ? 'Header-Name' : '$.data.token'}
            disabled={!rule.enabled}
            variant="compact"
            className="text-sm"
          />
        </div>
        <TrashButton onClick={onRemove} />
      </div>

      {(rule.path || rule.headerName) && rule.variableName && (
        <p className="text-xs text-muted-foreground mt-1 ml-7">
          {t('will_set_variable_preview', {
            source: rule.source === 'header' ? rule.headerName : rule.path,
            variable: rule.variableName,
          })}
        </p>
      )}
    </div>
  );
};

VariableExtractionEditor.displayName = 'VariableExtractionEditor';
