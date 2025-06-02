import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useRef,
} from 'react';
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
  value?: KeyValuePair[];
  initialBody?: KeyValuePair[]; // Deprecated: use value instead
  method: string; // To determine if body is applicable and to re-initialize on method change
  onChange?: (pairs: KeyValuePair[]) => void;
  containerHeight?: number | string;
  addRowLabelKey?: string;
}

export const BodyEditorKeyValue = forwardRef<BodyEditorKeyValueRef, BodyEditorKeyValueProps>(
  ({ value, initialBody, method, onChange, containerHeight = 300, addRowLabelKey }, ref) => {
    const { t } = useTranslation();

    // Support both controlled (value) and uncontrolled (initialBody) modes
    const isControlled = value !== undefined;
    const [internalBody, setInternalBody] = useState<KeyValuePair[]>(() => {
      if (method === 'GET' || method === 'HEAD') {
        return [];
      }
      return initialBody || [];
    });

    // Use value if controlled, otherwise use internal state
    const body = isControlled ? value : internalBody;
    const setBody = useCallback(
      (newBody: KeyValuePair[]) => {
        if (!isControlled) {
          setInternalBody(newBody);
        }
        onChange?.(newBody);
      },
      [isControlled, onChange],
    );

    const [showImport, setShowImport] = useState(false);
    const [importText, setImportText] = useState('');
    const [importError, setImportError] = useState('');
    const modifiers = [
      restrictToParentElement,
      restrictToWindowEdges, // 端を少し越えたら慣性風に戻す
    ];

    // Track previous method to detect changes
    const prevMethodRef = useRef(method);

    useEffect(() => {
      // Only clear body when method CHANGES TO GET/HEAD
      const prevMethod = prevMethodRef.current;
      prevMethodRef.current = method;

      if (prevMethod !== method && (method === 'GET' || method === 'HEAD')) {
        if (body.length > 0) {
          setBody([]);
        }
      }
    }, [method, body.length, setBody]);

    const importFromJson = useCallback(
      (json: string): boolean => {
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
      },
      [setBody],
    );

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
        const oldIndex = body.findIndex((p) => p.id === activeId);
        const newIndex = body.findIndex((p) => p.id === overId);
        setBody(arrayMove(body, oldIndex, newIndex));
      },
    }));

    const handleKeyValuePairChange = useCallback(
      (id: string, field: keyof Omit<KeyValuePair, 'id'>, newValue: string | boolean) => {
        setBody(body.map((pair) => (pair.id === id ? { ...pair, [field]: newValue } : pair)));
      },
      [body, setBody],
    );

    const handleAddKeyValuePair = useCallback(() => {
      const newPair = {
        id: `kv-new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        keyName: '',
        value: '',
        enabled: true,
      };
      setBody([...body, newPair]);
    }, [body, setBody]);

    const handleRemoveKeyValuePair = useCallback(
      (id: string) => {
        setBody(body.filter((pair) => pair.id !== id));
      },
      [body, setBody],
    );

    const handleDragEnd = useCallback(
      (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = body.findIndex((p) => p.id === active.id);
        const newIndex = body.findIndex((p) => p.id === over.id);
        setBody(arrayMove(body, oldIndex, newIndex));
      },
      [body, setBody],
    );

    const handleToggleAll = useCallback(
      (enable: boolean) => {
        setBody(body.map((pair) => ({ ...pair, enabled: enable })));
      },
      [body, setBody],
    );

    const isBodyApplicable = !(method === 'GET' || method === 'HEAD');

    if (!isBodyApplicable) {
      return <p className="text-muted-foreground text-[0.9em]">{t('body_not_applicable', { method })}</p>;
    }

    return (
      <div className="flex flex-col gap-2">
        <ScrollableContainer height={containerHeight}>
          <DndContext onDragEnd={handleDragEnd} modifiers={modifiers}>
            <SortableContext items={body}>
              <div className="flex flex-col gap-4">
                {body.map((pair) => (
                  <BodyKeyValueRow
                    key={pair.id}
                    pair={pair}
                    onChange={handleKeyValuePairChange}
                    onRemove={handleRemoveKeyValuePair}
                  />
                ))}
              </div>
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
            className="px-4 py-2 text-sm text-white bg-secondary rounded"
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
