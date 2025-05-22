import * as React from 'react';
import { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { EnableAllButton } from './atoms/button/EnableAllButton';
import { DisableAllButton } from './atoms/button/DisableAllButton';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { restrictToParentElement, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { BodyKeyValueRow } from './molecules/BodyKeyValueRow';
import { Modal } from './atoms/Modal';
import { ScrollableContainer } from './atoms/ScrollableContainer';
import type { BodyEditorKeyValueRef, KeyValuePair } from '../types';

interface BodyEditorKeyValueProps {
  initialBody?: KeyValuePair[];
  method: string; // To determine if body is applicable and to re-initialize on method change
  onChange?: (pairs: KeyValuePair[]) => void;
  containerHeight?: number | string;
  addRowLabelKey?: string;
}

export const BodyEditorKeyValue = forwardRef<BodyEditorKeyValueRef, BodyEditorKeyValueProps>(
  ({ initialBody, method, onChange, containerHeight = 300, addRowLabelKey }, ref) => {
    const { t } = useTranslation();
    const [body, setBody] = useState<KeyValuePair[]>([]);
    const [showImport, setShowImport] = useState(false);
    const [importText, setImportText] = useState('');
    const [importError, setImportError] = useState('');
    const modifiers = [
      restrictToParentElement,
      restrictToWindowEdges, // 端を少し越えたら慣性風に戻す
    ];

    useEffect(() => {
      if (method === 'GET' || method === 'HEAD') {
        if (body.length > 0) {
          setBody([]);
        }
        return;
      }

      if (initialBody && initialBody.length > 0) {
        if (JSON.stringify(initialBody) !== JSON.stringify(body)) {
          setBody(initialBody);
        }
      } else if (body.length === 0) {
        setBody([
          {
            id: `kv-new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            keyName: '',
            value: '',
            enabled: true,
          },
        ]);
      }
    }, [initialBody, method]);

    useEffect(() => {
      onChange?.(body);
    }, [body, onChange]);

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
        setBody(newPairs);
        return true;
      } catch {
        return false;
      }
    }, []);

    useImperativeHandle(ref, () => ({
      getCurrentBodyAsJson: () => {
        if (method === 'GET' || method === 'HEAD' || body.length === 0) {
          return '';
        }
        try {
          const jsonObject = body.reduce(
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
        return body;
      },
      importFromJson,
      triggerDrag: (activeId: string, overId: string) => {
        setBody((prev) => {
          const oldIndex = prev.findIndex((p) => p.id === activeId);
          const newIndex = prev.findIndex((p) => p.id === overId);
          return arrayMove(prev, oldIndex, newIndex);
        });
      },
    }));

    const handleKeyValuePairChange = useCallback(
      (id: string, field: keyof Omit<KeyValuePair, 'id'>, newValue: string | boolean) => {
        setBody((prevPairs) =>
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
      setBody((prev) => [...prev, newPair]);
    }, []);

    const handleRemoveKeyValuePair = useCallback((id: string) => {
      setBody((prevPairs) => prevPairs.filter((pair) => pair.id !== id));
    }, []);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      setBody((prev) => {
        const oldIndex = prev.findIndex((p) => p.id === active.id);
        const newIndex = prev.findIndex((p) => p.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }, []);

    const handleToggleAll = useCallback((enable: boolean) => {
      setBody((prevPairs) => prevPairs.map((pair) => ({ ...pair, enabled: enable })));
    }, []);

    const isBodyApplicable = !(method === 'GET' || method === 'HEAD');

    if (!isBodyApplicable) {
      return <p className="text-gray-600 text-[0.9em]">{t('body_not_applicable', { method })}</p>;
    }

    return (
      <div className="flex flex-col gap-2">
        <ScrollableContainer height={containerHeight}>
          <DndContext onDragEnd={handleDragEnd} modifiers={modifiers}>
            <SortableContext items={body}>
              {body.map((pair) => (
                <BodyKeyValueRow
                  key={pair.id}
                  pair={pair}
                  onChange={handleKeyValuePairChange}
                  onRemove={handleRemoveKeyValuePair}
                />
              ))}
            </SortableContext>
          </DndContext>
        </ScrollableContainer>
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleAddKeyValuePair}
            className="px-4 py-2 text-sm text-white bg-blue-500 rounded"
          >
            {t(addRowLabelKey || 'add_body_row')}
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
          <EnableAllButton onClick={() => handleToggleAll(true)} disabled={body.length === 0} />
          <DisableAllButton onClick={() => handleToggleAll(false)} disabled={body.length === 0} />
        </div>
        <Modal isOpen={showImport} onClose={() => setShowImport(false)} size="xl">
          <textarea
            value={importText}
            placeholder={t('paste_json') || 'Paste JSON here'}
            onChange={(e) => setImportText(e.target.value)}
            className="w-full h-[300px]"
          />
          {importError && <p className="text-red-500">{importError}</p>}
          <div className="flex justify-end gap-[10px]">
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
