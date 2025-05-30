import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from './atoms/Modal';
import { BaseButton } from './atoms/button/BaseButton';
import { TextInput } from './atoms/form/TextInput';
import { DeleteButton } from './atoms/button/DeleteButton';
import type { Variable } from '../types';
import { useVariablesStore } from '../store/variablesStore';
import { FiPlus, FiCheck, FiX } from 'react-icons/fi';
import clsx from 'clsx';

interface VariablesModalProps {
  isOpen: boolean;
  onClose: () => void;
  scope: 'global' | 'collections' | 'folders' | 'requests';
  scopeId?: string | null;
  title?: string;
}

export const VariablesModal: React.FC<VariablesModalProps> = ({
  isOpen,
  onClose,
  scope,
  scopeId,
  title,
}) => {
  const { t } = useTranslation();
  const {
    getVariables,
    addVariable,
    updateVariable,
    deleteVariable,
    validateVariableName,
  } = useVariablesStore();

  const [variables, setVariables] = useState<Variable[]>([]);
  const [editedVariables, setEditedVariables] = useState<Record<string, Partial<Variable>>>({});
  const [newVariable, setNewVariable] = useState({ name: '', value: '', enabled: true });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load variables when modal opens
  useEffect(() => {
    if (isOpen) {
      const currentVariables = getVariables(scope, scopeId);
      setVariables(currentVariables);
      setEditedVariables({});
      setNewVariable({ name: '', value: '', enabled: true });
      setErrors({});
    }
  }, [isOpen, scope, scopeId, getVariables]);

  const validateVariable = (name: string, id?: string): string | null => {
    if (!name.trim()) {
      return 'Variable name is required';
    }

    if (!validateVariableName(name)) {
      return t('variables_name_invalid');
    }

    // Check for duplicates
    const exists = variables.some((v) => v.name === name && v.id !== id);
    if (exists) {
      return t('variables_name_duplicate');
    }

    return null;
  };

  const handleAddVariable = () => {
    const error = validateVariable(newVariable.name);
    if (error) {
      setErrors({ new: error });
      return;
    }

    addVariable(scope, scopeId || null, {
      name: newVariable.name.trim(),
      value: newVariable.value,
      enabled: newVariable.enabled,
    });

    // Refresh the list
    const updatedVariables = getVariables(scope, scopeId);
    setVariables(updatedVariables);
    setNewVariable({ name: '', value: '', enabled: true });
    setErrors({});
  };

  const handleVariableChange = (id: string, field: keyof Omit<Variable, 'id'>, value: string | boolean) => {
    setEditedVariables(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));

    // Clear error when user starts editing
    if (errors[id]) {
      const newErrors = { ...errors };
      delete newErrors[id];
      setErrors(newErrors);
    }
  };

  const handleDeleteVariable = (id: string) => {
    deleteVariable(scope, scopeId || null, id);
    
    // Refresh the list
    const updatedVariables = getVariables(scope, scopeId);
    setVariables(updatedVariables);
    
    // Clear error for this variable
    const newErrors = { ...errors };
    delete newErrors[id];
    setErrors(newErrors);
  };

  const saveAllChanges = () => {
    // Validate and save edited variables
    const newErrors: Record<string, string> = {};
    
    Object.entries(editedVariables).forEach(([id, changes]) => {
      if (changes.name !== undefined) {
        const error = validateVariable(changes.name, id);
        if (error) {
          newErrors[id] = error;
          return;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Apply all changes
    Object.entries(editedVariables).forEach(([id, changes]) => {
      updateVariable(scope, scopeId || null, id, changes);
    });

    // Refresh the list
    const updatedVariables = getVariables(scope, scopeId);
    setVariables(updatedVariables);
    setEditedVariables({});
    setErrors({});
  };

  const handleClose = () => {
    setErrors({});
    setEditedVariables({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title || t('variables_modal_title')}>
      <div className="space-y-4">
        {/* Variables List */}
        <div className="space-y-2">
          {variables.map((variable) => {
            const editedValue = editedVariables[variable.id];
            const currentName = editedValue?.name !== undefined ? editedValue.name : variable.name;
            const currentValue = editedValue?.value !== undefined ? editedValue.value : variable.value;
            const currentEnabled = editedValue?.enabled !== undefined ? editedValue.enabled : variable.enabled;
            
            return (
              <div key={variable.id} className="flex items-center gap-2 p-2 border rounded dark:border-gray-600">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div>
                    <TextInput
                      value={currentName}
                      onChange={(e) => handleVariableChange(variable.id, 'name', e.target.value)}
                      placeholder={t('variables_modal_name')}
                      className={clsx(errors[variable.id] && 'border-red-500')}
                    />
                    {errors[variable.id] && (
                      <div className="text-red-500 text-xs mt-1">{errors[variable.id]}</div>
                    )}
                  </div>
                  <TextInput
                    value={currentValue}
                    onChange={(e) => handleVariableChange(variable.id, 'value', e.target.value)}
                    placeholder={t('variables_modal_value')}
                  />
                </div>
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={currentEnabled}
                    onChange={(e) => handleVariableChange(variable.id, 'enabled', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-xs">{t('variables_modal_enabled')}</span>
                </label>
                <DeleteButton
                  onClick={() => handleDeleteVariable(variable.id)}
                  size="sm"
                  aria-label={t('variables_modal_delete')}
                />
              </div>
            );
          })}
        </div>

        {/* Add New Variable */}
        <div className="border-t pt-4 dark:border-gray-600">
          <div className="flex items-center gap-2">
            <div className="flex-1 grid grid-cols-2 gap-2">
              <div>
                <TextInput
                  value={newVariable.name}
                  onChange={(e) => setNewVariable({ ...newVariable, name: e.target.value })}
                  placeholder={t('variables_modal_name')}
                  className={clsx(errors.new && 'border-red-500')}
                />
                {errors.new && (
                  <div className="text-red-500 text-xs mt-1">{errors.new}</div>
                )}
              </div>
              <TextInput
                value={newVariable.value}
                onChange={(e) => setNewVariable({ ...newVariable, value: e.target.value })}
                placeholder={t('variables_modal_value')}
              />
            </div>
            <label className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={newVariable.enabled}
                onChange={(e) => setNewVariable({ ...newVariable, enabled: e.target.checked })}
                className="rounded"
              />
              <span className="text-xs">{t('variables_modal_enabled')}</span>
            </label>
            <BaseButton
              onClick={handleAddVariable}
              size="sm"
              className="flex items-center gap-1 px-3 py-2"
              disabled={!newVariable.name.trim()}
            >
              <FiPlus size={16} />
              {t('variables_modal_add')}
            </BaseButton>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-600">
          <BaseButton variant="ghost" onClick={handleClose}>
            <FiX size={16} className="mr-1" />
            {t('variables_modal_cancel')}
          </BaseButton>
          <BaseButton onClick={() => { saveAllChanges(); handleClose(); }}>
            <FiCheck size={16} className="mr-1" />
            {t('variables_modal_save')}
          </BaseButton>
        </div>
      </div>
    </Modal>
  );
};