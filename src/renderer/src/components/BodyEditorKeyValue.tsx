import * as React from 'react';
import { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export interface KeyValuePair {
  id: string;
  keyName: string;
  value: string;
  enabled: boolean;
}

export interface BodyEditorKeyValueRef {
  getCurrentBodyAsJson: () => string;
  getCurrentKeyValuePairs: () => KeyValuePair[];
}

interface BodyEditorKeyValueProps {
  initialBodyKeyValuePairs?: KeyValuePair[];
  method: string; // To determine if body is applicable and to re-initialize on method change
}

export const BodyEditorKeyValue = forwardRef<BodyEditorKeyValueRef, BodyEditorKeyValueProps>(
  ({ initialBodyKeyValuePairs, method }, ref) => {
    const { t } = useTranslation();
    const [bodyKeyValuePairs, setBodyKeyValuePairs] = useState<KeyValuePair[]>([]);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importText, setImportText] = useState('');
    const [importError, setImportError] = useState('');

    useEffect(() => {
      if (method === 'GET' || method === 'HEAD') {
        setBodyKeyValuePairs([]);
        return;
      }

      if (initialBodyKeyValuePairs) {
        if (JSON.stringify(initialBodyKeyValuePairs) !== JSON.stringify(bodyKeyValuePairs)) {
          setBodyKeyValuePairs(initialBodyKeyValuePairs);
        }
      } else if (bodyKeyValuePairs.length > 0) {
        setBodyKeyValuePairs([]);
      }
    }, [initialBodyKeyValuePairs, method]);

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
            {} as Record<string, any>,
          );
          return Object.keys(jsonObject).length > 0 ? JSON.stringify(jsonObject, null, 2) : '';
        } catch (e) {
          // console.error("BodyEditorKeyValue: Error constructing JSON from K-V pairs:", e);
          return '';
        }
      },
      getCurrentKeyValuePairs: () => {
        return bodyKeyValuePairs;
      },
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

    const handleImportPairs = useCallback(() => {
      try {
        const obj = JSON.parse(importText);
        if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
          throw new Error('invalid');
        }
        const pairs: KeyValuePair[] = Object.entries(obj).map(([key, value]) => ({
          id: `kv-import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          keyName: key,
          value: typeof value === 'string' ? value : JSON.stringify(value),
          enabled: true,
        }));
        setBodyKeyValuePairs(pairs);
        setImportText('');
        setImportError('');
        setShowImportModal(false);
      } catch {
        setImportError(t('invalid_json'));
      }
    }, [importText]);

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
          <div key={pair.id} style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={pair.enabled}
              onChange={(e) => handleKeyValuePairChange(pair.id, 'enabled', e.target.checked)}
              title={pair.enabled ? 'Disable this row' : 'Enable this row'}
              style={{ marginRight: '5px' }}
            />
            <input
              type="text"
              placeholder="Key"
              value={pair.keyName}
              onChange={(e) => handleKeyValuePairChange(pair.id, 'keyName', e.target.value)}
              style={{
                flexGrow: 1,
                padding: '8px',
                fontSize: '0.95em',
                boxSizing: 'border-box',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
              disabled={!pair.enabled}
            />
            <input
              type="text"
              placeholder="Value (JSON or string)"
              value={pair.value}
              onChange={(e) => handleKeyValuePairChange(pair.id, 'value', e.target.value)}
              style={{
                flexGrow: 2,
                padding: '8px',
                fontSize: '0.95em',
                boxSizing: 'border-box',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
              disabled={!pair.enabled}
            />
            <button
              onClick={() => handleMoveKeyValuePair(index, 'up')}
              disabled={index === 0}
              style={{
                padding: '6px',
                fontSize: '0.8em',
                cursor: 'pointer',
                border: '1px solid #ccc',
                backgroundColor: 'white',
              }}
              title="Move Up"
            >
              ↑
            </button>
            <button
              onClick={() => handleMoveKeyValuePair(index, 'down')}
              disabled={index === bodyKeyValuePairs.length - 1}
              style={{
                padding: '6px',
                fontSize: '0.8em',
                cursor: 'pointer',
                border: '1px solid #ccc',
                backgroundColor: 'white',
              }}
              title="Move Down"
            >
              ↓
            </button>
            <button
              onClick={() => handleRemoveKeyValuePair(pair.id)}
              style={{
                padding: '6px 10px',
                fontSize: '0.9em',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          onClick={handleAddKeyValuePair}
          style={{
            marginTop: '10px',
            padding: '8px 15px',
            fontSize: '0.95em',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            alignSelf: 'flex-start',
            cursor: 'pointer',
          }}
        >
          {t('add_body_row')}
        </button>
        <button
          onClick={() => setShowImportModal(true)}
          style={{
            marginTop: '10px',
            padding: '8px 15px',
            fontSize: '0.95em',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            alignSelf: 'flex-start',
            cursor: 'pointer',
          }}
        >
          {t('import_json')}
        </button>

        {showImportModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: 'white',
                padding: '20px',
                borderRadius: '4px',
                width: '80%',
                maxWidth: '500px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={10}
                placeholder='{"key":"value"}'
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                }}
              />
              {importError && <p style={{ color: 'red' }}>{importError}</p>}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportText('');
                    setImportError('');
                  }}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #ccc',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                  }}
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleImportPairs}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                  }}
                >
                  {t('done')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

BodyEditorKeyValue.displayName = 'BodyEditorKeyValue';
