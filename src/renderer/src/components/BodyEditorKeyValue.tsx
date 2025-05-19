import * as React from 'react';
import { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { EnableAllButton } from './atoms/button/EnableAllButton';
import { DisableAllButton } from './atoms/button/DisableAllButton';
import { MoveUpButton } from './atoms/button/MoveUpButton';
import { MoveDownButton } from './atoms/button/MoveDownButton';
import { TrashButton } from './atoms/button/TrashButton';
import { Modal } from './atoms/Modal';
import type { BodyEditorKeyValueRef, KeyValuePair } from '../types';

interface BodyEditorKeyValueProps {
  initialBody?: KeyValuePair[];
  method: string; // To determine if body is applicable and to re-initialize on method change
  onChange?: (pairs: KeyValuePair[]) => void;
}

export const BodyEditorKeyValue = forwardRef<BodyEditorKeyValueRef, BodyEditorKeyValueProps>(
  ({ initialBody, method, onChange }, ref) => {
    const { t } = useTranslation();
    const [bodyKeyValuePairs, setBodyKeyValuePairs] = useState<KeyValuePair[]>([]);
    const [showImport, setShowImport] = useState(false);
    const [importText, setImportText] = useState('');
    const [importError, setImportError] = useState('');

    useEffect(() => {
      if (method === 'GET' || method === 'HEAD') {
        if (bodyKeyValuePairs.length > 0) {
          setBodyKeyValuePairs([]);
        }
        return;
      }

      if (initialBody) {
        if (JSON.stringify(initialBody) !== JSON.stringify(bodyKeyValuePairs)) {
          setBodyKeyValuePairs(initialBody);
        }
      } else if (bodyKeyValuePairs.length > 0) {
        setBodyKeyValuePairs([]);
      }
    }, [initialBody, method]);

    useEffect(() => {
      onChange?.(bodyKeyValuePairs);
    }, [bodyKeyValuePairs, onChange]);

    const importFromJson = useCallback((json: string): boolean => {
      try {
        const obj = JSON.parse(json);
        if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
          return false;
        }
        const newPairs = Object.entries(obj).map(([key, val]) => ({
          id: `kv-import-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          keyName: key,
          value: typeof val === 'string' ? val : JSON.stringify(val),
          enabled: true,
        }));
        setBodyKeyValuePairs(newPairs);
        return true;
      } catch {
        return false;
      }
    }, []);

    useImperativeHandle(ref, () => ({
      getCurrentBodyAsJson: () => {
        if (method === 'GET' || method === 'HEAD' || bodyKeyValuePairs.length === 0) {
          return '';
        }
        try {
          const jsonObject = bodyKeyValuePairs.reduce(
            (obj, pair) => {
              if (pair.enabled && pair.keyName.trim() !== '') {
                try {
                  obj[pair.keyName] = JSON.parse(pair.value);
                } catch {
                  obj[pair.keyName] = pair.value;
                }
              }
              return obj;
            },
            {} as Record<string, unknown>,
          );
          return Object.keys(jsonObject).length > 0 ? JSON.stringify(jsonObject, null, 2) : '';
        } catch {
          // console.error("BodyEditorKeyValue: Error constructing JSON from K-V pairs:", e);
          return '';
        }
      },
      getCurrentKeyValuePairs: () => {
        return bodyKeyValuePairs;
      },
      importFromJson,
    }));

    const handleKeyValuePairChange = useCallback(
      (id: string, field: keyof Omit<KeyValuePair, 'id'>, newValue: string | boolean) => {
        setBodyKeyValuePairs((prevPairs) =>
          prevPairs.map((pair) => (pair.id === id ? { ...pair, [field]: newValue } : pair)),
        );
      },
      [],
    );

    const handleAddKeyValuePair = useCallback(() => {
      const newPair = {
        id: `kv-new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        keyName: '',
        value: '',
        enabled: true,
      };
      setBodyKeyValuePairs((prev) => [...prev, newPair]);
    }, []);

    const handleRemoveKeyValuePair = useCallback((id: string) => {
      setBodyKeyValuePairs((prevPairs) => prevPairs.filter((pair) => pair.id !== id));
    }, []);

    const handleMoveKeyValuePair = useCallback((index: number, direction: 'up' | 'down') => {
      setBodyKeyValuePairs((prevPairs) => {
        const newPairs = [...prevPairs];
        if (newPairs.length === 0 || index < 0 || index >= newPairs.length) return newPairs;
        const itemToMove = newPairs[index];

        if (direction === 'up' && index > 0) {
          newPairs.splice(index, 1);
          newPairs.splice(index - 1, 0, itemToMove);
        } else if (direction === 'down' && index < newPairs.length - 1) {
          newPairs.splice(index, 1);
          newPairs.splice(index + 1, 0, itemToMove);
        }
        return newPairs;
      });
    }, []);

    const handleToggleAll = useCallback((enable: boolean) => {
      setBodyKeyValuePairs((prevPairs) => prevPairs.map((pair) => ({ ...pair, enabled: enable })));
    }, []);

    const isBodyApplicable = !(method === 'GET' || method === 'HEAD');

    if (!isBodyApplicable) {
      return (
        <p style={{ color: '#6c757d', fontSize: '0.9em' }}>
          {t('body_not_applicable', { method })}
        </p>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {bodyKeyValuePairs.map((pair, index) => (
          <div key={pair.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={pair.enabled}
              onChange={(e) => handleKeyValuePairChange(pair.id, 'enabled', e.target.checked)}
              title={pair.enabled ? 'Disable this row' : 'Enable this row'}
              className="mr-1"
            />
            <input
              type="text"
              placeholder="Key"
              value={pair.keyName}
              onChange={(e) => handleKeyValuePairChange(pair.id, 'keyName', e.target.value)}
              className="flex-1 p-2 text-sm border border-gray-300 rounded"
              disabled={!pair.enabled}
            />
            <input
              type="text"
              placeholder="Value (JSON or string)"
              value={pair.value}
              onChange={(e) => handleKeyValuePairChange(pair.id, 'value', e.target.value)}
              className="flex-2 p-2 text-sm border border-gray-300 rounded"
              disabled={!pair.enabled}
            />
            <MoveUpButton
              onClick={() => handleMoveKeyValuePair(index, 'up')}
              disabled={index === 0}
              className="mx-1"
            />
            <MoveDownButton
              onClick={() => handleMoveKeyValuePair(index, 'down')}
              disabled={index === bodyKeyValuePairs.length - 1}
              className="mx-1"
            />
            <TrashButton onClick={() => handleRemoveKeyValuePair(pair.id)} />
          </div>
        ))}
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleAddKeyValuePair}
            className="px-4 py-2 text-sm text-white bg-blue-500 rounded"
          >
            {t('add_body_row') || 'Add Body Row'}
          </button>
          <button
            onClick={() => {
              setShowImport(true);
              setImportText('');
              setImportError('');
            }}
            className="px-4 py-2 text-sm text-white bg-gray-600 rounded"
          >
            {t('import_json') || 'Import JSON'}
          </button>
          <EnableAllButton
            onClick={() => handleToggleAll(true)}
            disabled={bodyKeyValuePairs.length === 0}
          />
          <DisableAllButton
            onClick={() => handleToggleAll(false)}
            disabled={bodyKeyValuePairs.length === 0}
          />
        </div>
        <Modal isOpen={showImport} onClose={() => setShowImport(false)} size="xl">
          <textarea
            value={importText}
            placeholder={t('paste_json') || 'Paste JSON here'}
            onChange={(e) => setImportText(e.target.value)}
            style={{ width: '100%', height: '300px' }}
          />
          {importError && <p style={{ color: 'red' }}>{importError}</p>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button onClick={() => setShowImport(false)}>{t('cancel') || 'Cancel'}</button>
            <button
              onClick={() => {
                if (importFromJson(importText)) {
                  setShowImport(false);
                  setImportText('');
                  setImportError('');
                } else {
                  setImportError(t('invalid_json'));
                }
              }}
            >
              {t('import') || 'Import'}
            </button>
          </div>
        </Modal>
      </div>
    );
  },
);

BodyEditorKeyValue.displayName = 'BodyEditorKeyValue';
