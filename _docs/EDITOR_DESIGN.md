# エディター機能 詳細設計書

## 1. 概要

エディター機能は、APIリクエストの作成・編集を行うメインインターフェースです。リクエスト名、HTTPメソッド、URL、ヘッダー、ボディ、パラメータを統合的に編集でき、直感的なKey-Value形式とJSON形式の両方をサポートします。

### 主要特徴

- **統合エディター**: リクエストのすべての要素を一画面で編集
- **タブ切り替え**: Headers/Body/Paramsのタブ形式編集
- **Key-Value編集**: 直感的なKey-Valueペア編集
- **JSON対応**: JSONインポート・エクスポート機能
- **ドラッグ&ドロップ**: 項目の並び替え
- **バリデーション**: リアルタイム入力検証
- **自動保存**: 編集状態の自動管理

---

## 2. アーキテクチャ

### 2.1 コンポーネント階層

```
RequestEditorPanel (メインコンテナ)
├── RequestNameRow (リクエスト名編集)
├── RequestMethodRow (メソッド・URL編集)
└── タブコンテンツ
    ├── HeadersEditor (ヘッダー編集)
    ├── BodyEditorKeyValue (ボディ編集)
    └── ParamsEditorKeyValue (パラメータ編集)
```

### 2.2 データフロー

```
App Component
    ↓ (props)
RequestEditorPanel
    ↓ (forwardRef)
Individual Editors
    ↓ (onChange)
Parent State Update
    ↓ (useEffect)
Request Execution
```

### 2.3 状態管理設計

#### ローカル状態 vs グローバル状態

- **ローカル状態**: UI操作用の一時的なデータ
- **グローバル状態**: 保存・送信用の確定データ
- **Ref API**: 親コンポーネントからの命令的操作

---

## 3. データ構造

### 3.1 型定義

#### KeyValuePair

```typescript
interface KeyValuePair {
  id: string; // 一意識別子
  keyName: string; // キー名
  value: string; // 値
  enabled: boolean; // 有効/無効フラグ
}
```

#### RequestHeader

```typescript
interface RequestHeader {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}
```

#### エディターRef API

```typescript
interface RequestEditorPanelRef {
  getRequestBodyAsJson: () => string;
  getBody: () => KeyValuePair[];
  getParams: () => KeyValuePair[];
}

interface BodyEditorKeyValueRef {
  getCurrentBodyAsJson: () => string;
  getCurrentKeyValuePairs: () => KeyValuePair[];
  importFromJson: (json: string) => boolean;
  triggerDrag?: (activeId: string, overId: string) => void;
}
```

### 3.2 データ変換

#### Key-Value ↔ JSON変換

```typescript
// Key-Value → JSON
const convertToJson = (pairs: KeyValuePair[]): string => {
  const enabledPairs = pairs.filter((pair) => pair.enabled && pair.keyName.trim());
  const obj = enabledPairs.reduce(
    (acc, pair) => {
      acc[pair.keyName] = pair.value;
      return acc;
    },
    {} as Record<string, string>,
  );

  return JSON.stringify(obj, null, 2);
};

// JSON → Key-Value
const convertFromJson = (jsonString: string): KeyValuePair[] => {
  try {
    const parsed = JSON.parse(jsonString);
    if (typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Object expected');
    }

    return Object.entries(parsed).map(([key, value]) => ({
      id: `kv-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      keyName: key,
      value: String(value),
      enabled: true,
    }));
  } catch (error) {
    return [];
  }
};
```

---

## 4. 核心コンポーネント

### 4.1 RequestEditorPanel

#### 責任範囲

- **全体レイアウト**: エディター全体の配置・構成
- **タブ管理**: Headers/Body/Paramsタブの切り替え
- **データ統合**: 各エディターからのデータ収集
- **外部API**: Refを通じた親コンポーネントとの連携

#### 実装詳細

```typescript
const RequestEditorPanel = forwardRef<RequestEditorPanelRef, Props>((props, ref) => {
  const [activeTab, setActiveTab] = useState<'headers' | 'body' | 'params'>('headers');

  // Ref API の実装
  useImperativeHandle(ref, () => ({
    getRequestBodyAsJson: () => bodyEditorRef.current?.getCurrentBodyAsJson() ?? '{}',
    getBody: () => bodyEditorRef.current?.getCurrentKeyValuePairs() ?? [],
    getParams: () => paramsEditorRef.current?.getCurrentKeyValuePairs() ?? []
  }));

  // HTTPメソッドによるBody表示制御
  const shouldDisableBody = ['GET', 'HEAD'].includes(method);

  return (
    <div className="request-editor-panel">
      <RequestNameRow {...nameProps} />
      <RequestMethodRow {...methodProps} />

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="tab-content">
        <HeadersEditor style={{ display: activeTab === 'headers' ? 'block' : 'none' }} />
        <BodyEditorKeyValue
          style={{ display: activeTab === 'body' ? 'block' : 'none' }}
          disabled={shouldDisableBody}
        />
        <ParamsEditorKeyValue style={{ display: activeTab === 'params' ? 'block' : 'none' }} />
      </div>
    </div>
  );
});
```

### 4.2 Key-Valueエディター基盤

#### 共通アーキテクチャ

```typescript
const KeyValueEditor: React.FC<Props> = ({
  initialData,
  onChange,
  disabled = false
}) => {
  const [pairs, setPairs] = useState<KeyValuePair[]>([]);

  // 初期データの同期
  useEffect(() => {
    if (JSON.stringify(initialData) !== JSON.stringify(pairs)) {
      setPairs(initialData || []);
    }
  }, [initialData]);

  // 変更通知
  useEffect(() => {
    onChange?.(pairs);
  }, [pairs, onChange]);

  // CRUD操作
  const addPair = () => setPairs(prev => [...prev, createEmptyPair()]);
  const updatePair = (id: string, field: string, value: any) => {
    setPairs(prev => prev.map(pair =>
      pair.id === id ? { ...pair, [field]: value } : pair
    ));
  };
  const removePair = (id: string) => {
    setPairs(prev => prev.filter(pair => pair.id !== id));
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext items={pairs.map(p => p.id)}>
        {pairs.map(pair => (
          <KeyValueRow key={pair.id} pair={pair} onUpdate={updatePair} />
        ))}
      </SortableContext>
    </DndContext>
  );
};
```

#### ドラッグ&ドロップ実装

```typescript
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  if (!over || active.id === over.id) return;

  setPairs(prev => {
    const oldIndex = prev.findIndex(p => p.id === active.id);
    const newIndex = prev.findIndex(p => p.id === over.id);
    return arrayMove(prev, oldIndex, newIndex);
  });
};

// @dnd-kit/sortableの活用
const KeyValueRow: React.FC<RowProps> = ({ pair, onUpdate }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: pair.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1
  };

  return (
    <div ref={setNodeRef} style={style} className="key-value-row">
      <DragHandleButton {...attributes} {...listeners} />
      <Checkbox checked={pair.enabled} onChange={(enabled) => onUpdate(pair.id, 'enabled', enabled)} />
      <TextInput value={pair.keyName} onChange={(value) => onUpdate(pair.id, 'keyName', value)} />
      <TextInput value={pair.value} onChange={(value) => onUpdate(pair.id, 'value', value)} />
      <DeleteButton onClick={() => onRemove(pair.id)} />
    </div>
  );
};
```

### 4.3 HeadersEditor

#### 専用実装の理由

- **型の違い**: `RequestHeader` vs `KeyValuePair`
- **専用機能**: HTTP Header特有の機能（プリセット、バリデーション）
- **将来拡張**: Header特化の機能追加予定

#### 実装特徴

```typescript
const HeadersEditor: React.FC<Props> = ({ headers, onAddHeader, onUpdateHeader, onRemoveHeader }) => {
  // 一括操作
  const enableAll = () => {
    headers.forEach(header => {
      if (!header.enabled) onUpdateHeader(header.id, 'enabled', true);
    });
  };

  const disableAll = () => {
    headers.forEach(header => {
      if (header.enabled) onUpdateHeader(header.id, 'enabled', false);
    });
  };

  // Header専用バリデーション
  const validateHeaderKey = (key: string): boolean => {
    return /^[a-zA-Z0-9\-_]+$/.test(key);
  };

  return (
    <div className="headers-editor">
      <div className="bulk-actions">
        <EnableAllButton onClick={enableAll} />
        <DisableAllButton onClick={disableAll} />
      </div>

      <ScrollableContainer>
        {headers.map(header => (
          <HeaderRow
            key={header.id}
            header={header}
            onUpdate={onUpdateHeader}
            onRemove={onRemoveHeader}
            validator={validateHeaderKey}
          />
        ))}
      </ScrollableContainer>

      <NewHeaderButton onClick={onAddHeader} />
    </div>
  );
};
```

### 4.4 BodyEditorKeyValue

#### JSON統合機能

```typescript
const BodyEditorKeyValue = forwardRef<BodyEditorKeyValueRef, Props>((props, ref) => {
  const [pairs, setPairs] = useState<KeyValuePair[]>([]);
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState('');

  useImperativeHandle(ref, () => ({
    getCurrentBodyAsJson: () => convertToJson(pairs),
    getCurrentKeyValuePairs: () => pairs,
    importFromJson: (json: string) => {
      try {
        const newPairs = convertFromJson(json);
        setPairs(newPairs);
        return true;
      } catch {
        return false;
      }
    },
    triggerDrag: (activeId: string, overId: string) => {
      // プログラマティックなドラッグ操作
      const dragEvent = createDragEvent(activeId, overId);
      handleDragEnd(dragEvent);
    }
  }));

  // JSONインポート機能
  const handleJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Object required');
      }

      const newPairs = Object.entries(parsed).map(([key, value]) => ({
        id: generateId(),
        keyName: key,
        value: String(value),
        enabled: true
      }));

      setPairs(newPairs);
      setJsonMode(false);

    } catch (error) {
      showErrorToast('Invalid JSON format');
    }
  };

  return (
    <div className="body-editor">
      <div className="editor-mode-toggle">
        <button onClick={() => setJsonMode(!jsonMode)}>
          {jsonMode ? 'Key-Value Mode' : 'JSON Mode'}
        </button>
      </div>

      {jsonMode ? (
        <div className="json-editor">
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder="Enter JSON object..."
          />
          <button onClick={handleJsonImport}>Import JSON</button>
        </div>
      ) : (
        <KeyValueEditor
          pairs={pairs}
          onChange={setPairs}
          disabled={props.disabled}
        />
      )}
    </div>
  );
});
```

---

## 5. データバリデーション

### 5.1 入力検証

#### リアルタイム検証

```typescript
const useValidation = <T>(value: T, validator: (value: T) => ValidationResult) => {
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    const result = validator(value);
    setError(result.error);
    setIsValid(result.isValid);
  }, [value, validator]);

  return { error, isValid };
};

// URL検証
const validateUrl = (url: string): ValidationResult => {
  if (!url.trim()) {
    return { isValid: false, error: 'URL is required' };
  }

  try {
    new URL(url);
    return { isValid: true, error: null };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
};

// Header検証
const validateHeaderKey = (key: string): ValidationResult => {
  if (!key.trim()) {
    return { isValid: false, error: 'Header name is required' };
  }

  if (!/^[a-zA-Z0-9\-_]+$/.test(key)) {
    return { isValid: false, error: 'Invalid header name format' };
  }

  return { isValid: true, error: null };
};

// JSON検証
const validateJson = (jsonString: string): ValidationResult => {
  if (!jsonString.trim()) {
    return { isValid: true, error: null };
  }

  try {
    const parsed = JSON.parse(jsonString);
    if (typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { isValid: false, error: 'JSON must be an object' };
    }
    return { isValid: true, error: null };
  } catch {
    return { isValid: false, error: 'Invalid JSON syntax' };
  }
};
```

### 5.2 フォーム送信前検証

#### 統合検証

```typescript
const validateRequestData = (requestData: RequestData): ValidationSummary => {
  const errors: ValidationError[] = [];

  // URL必須チェック
  if (!requestData.url.trim()) {
    errors.push({ field: 'url', message: 'URL is required' });
  }

  // Header検証
  requestData.headers.forEach((header, index) => {
    if (header.enabled && header.key.trim() && !validateHeaderKey(header.key).isValid) {
      errors.push({
        field: `headers[${index}].key`,
        message: `Invalid header name: ${header.key}`,
      });
    }
  });

  // Body JSON検証
  if (requestData.body && !validateJson(requestData.body).isValid) {
    errors.push({ field: 'body', message: 'Invalid JSON in request body' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
```

---

## 6. 状態管理とライフサイクル

### 6.1 状態同期パターン

#### Props → State同期

```typescript
const usePropStateSync = <T>(propValue: T, defaultValue: T) => {
  const [state, setState] = useState<T>(defaultValue);
  const prevPropRef = useRef<T>();

  useEffect(() => {
    // 深い比較で不要な更新を防止
    if (JSON.stringify(propValue) !== JSON.stringify(prevPropRef.current)) {
      setState(propValue);
      prevPropRef.current = propValue;
    }
  }, [propValue]);

  return [state, setState] as const;
};

// 使用例
const BodyEditor: React.FC<Props> = ({ initialBody, onChange }) => {
  const [bodyPairs, setBodyPairs] = usePropStateSync(initialBody, []);

  useEffect(() => {
    onChange?.(bodyPairs);
  }, [bodyPairs, onChange]);
};
```

#### デバウンス機能

```typescript
const useDebouncedCallback = <T extends any[]>(callback: (...args: T) => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay],
  );
};

// 使用例：入力変更のデバウンス
const handleValueChange = useDebouncedCallback((value: string) => {
  onUpdate(pair.id, 'value', value);
}, 300);
```

### 6.2 HTTPメソッド連動

#### Body表示制御

```typescript
const useMethodBasedBodyControl = (method: string) => {
  const shouldDisableBody = useMemo(() => {
    return ['GET', 'HEAD'].includes(method.toUpperCase());
  }, [method]);

  const shouldClearBody = useMemo(() => {
    return shouldDisableBody;
  }, [shouldDisableBody]);

  return { shouldDisableBody, shouldClearBody };
};

// RequestEditorPanelでの使用
const RequestEditorPanel: React.FC<Props> = ({ method, ...props }) => {
  const { shouldDisableBody, shouldClearBody } = useMethodBasedBodyControl(method);

  useEffect(() => {
    if (shouldClearBody) {
      // Body内容をクリア
      onBodyPairsChange([]);
    }
  }, [shouldClearBody, onBodyPairsChange]);

  return (
    <BodyEditorKeyValue
      disabled={shouldDisableBody}
      style={{
        opacity: shouldDisableBody ? 0.5 : 1,
        pointerEvents: shouldDisableBody ? 'none' : 'auto'
      }}
    />
  );
};
```

---

## 7. UI/UX設計

### 7.1 レスポンシブデザイン

#### フレキシブルレイアウト

```typescript
const EditorLayout: React.FC = () => (
  <div className="editor-container">
    <div className="editor-header">
      {/* 固定ヘッダー部分 */}
      <RequestNameRow />
      <RequestMethodRow />
    </div>

    <div className="editor-tabs">
      {/* タブナビゲーション */}
      <TabNavigation />
    </div>

    <div className="editor-content">
      {/* スクロール可能なコンテンツエリア */}
      <ScrollableContainer maxHeight="calc(100vh - 200px)">
        <TabContent />
      </ScrollableContainer>
    </div>
  </div>
);

// CSS設計
const styles = {
  editorContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: '400px'
  },
  editorContent: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  keyValueRow: {
    display: 'grid',
    gridTemplateColumns: 'auto auto 1fr 1fr auto',
    gap: '8px',
    alignItems: 'center',
    padding: '4px 0'
  }
};
```

### 7.2 アクセシビリティ

#### キーボードナビゲーション

```typescript
const useKeyboardNavigation = (
  pairs: KeyValuePair[],
  onChange: (pairs: KeyValuePair[]) => void,
) => {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, pairId: string, field: 'key' | 'value') => {
      switch (event.key) {
        case 'Tab':
          // 自然なタブ順序での移動
          break;

        case 'Enter':
          if (event.ctrlKey || event.metaKey) {
            // Ctrl+Enter: 新しい行を追加
            event.preventDefault();
            const newPair = createEmptyPair();
            onChange([...pairs, newPair]);
          }
          break;

        case 'Delete':
        case 'Backspace':
          if (event.ctrlKey && field === 'key') {
            // Ctrl+Delete: 行を削除
            event.preventDefault();
            onChange(pairs.filter((p) => p.id !== pairId));
          }
          break;

        case 'ArrowUp':
        case 'ArrowDown':
          if (event.ctrlKey) {
            // Ctrl+Arrow: 行の並び替え
            event.preventDefault();
            const direction = event.key === 'ArrowUp' ? -1 : 1;
            movePair(pairId, direction);
          }
          break;
      }
    },
    [pairs, onChange],
  );

  return handleKeyDown;
};
```

#### ARIA属性

```typescript
const AccessibleKeyValueRow: React.FC<Props> = ({ pair, onUpdate, onRemove }) => (
  <div
    role="row"
    aria-label={`Header: ${pair.keyName || 'Empty'}`}
    className="key-value-row"
  >
    <DragHandleButton
      aria-label="Reorder this header"
      tabIndex={0}
    />

    <Checkbox
      checked={pair.enabled}
      onChange={(enabled) => onUpdate(pair.id, 'enabled', enabled)}
      aria-label="Enable this header"
    />

    <TextInput
      value={pair.keyName}
      onChange={(value) => onUpdate(pair.id, 'keyName', value)}
      placeholder="Header name"
      aria-label="Header name"
      role="textbox"
    />

    <TextInput
      value={pair.value}
      onChange={(value) => onUpdate(pair.id, 'value', value)}
      placeholder="Header value"
      aria-label="Header value"
      role="textbox"
    />

    <DeleteButton
      onClick={() => onRemove(pair.id)}
      aria-label="Delete this header"
      tabIndex={0}
    />
  </div>
);
```

### 7.3 視覚的フィードバック

#### 状態表示

```typescript
const VisualStateIndicators: React.FC = () => {
  return (
    <>
      {/* 編集状態インジケーター */}
      <div className={`editor-status ${hasUnsavedChanges ? 'unsaved' : 'saved'}`}>
        {hasUnsavedChanges && (
          <span className="unsaved-indicator">
            <DotIcon /> Unsaved changes
          </span>
        )}
      </div>

      {/* バリデーションエラー表示 */}
      {validationErrors.map(error => (
        <div key={error.field} className="validation-error">
          <ErrorIcon />
          <span>{error.message}</span>
        </div>
      ))}

      {/* ローディング状態 */}
      {loading && (
        <div className="loading-overlay">
          <SpinnerIcon />
          <span>Sending request...</span>
        </div>
      )}
    </>
  );
};
```

#### アニメーション

```typescript
const AnimatedKeyValueRow: React.FC<Props> = ({ pair }) => {
  const [isNew, setIsNew] = useState(true);

  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => setIsNew(false), 300);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={`key-value-row ${isNew ? 'new-row' : ''}`}
    >
      {/* 行の内容 */}
    </motion.div>
  );
};
```

---

## 8. パフォーマンス最適化

### 8.1 レンダリング最適化

#### React.memo活用

```typescript
const KeyValueRow = React.memo<KeyValueRowProps>(
  ({ pair, onUpdate, onRemove }) => {
    // 行コンポーネントの実装
  },
  (prevProps, nextProps) => {
    // カスタム比較関数
    return (
      prevProps.pair.id === nextProps.pair.id &&
      prevProps.pair.keyName === nextProps.pair.keyName &&
      prevProps.pair.value === nextProps.pair.value &&
      prevProps.pair.enabled === nextProps.pair.enabled
    );
  },
);

const MemoizedHeadersEditor = React.memo(HeadersEditor, (prevProps, nextProps) => {
  return shallowEqual(prevProps.headers, nextProps.headers);
});
```

#### useCallback最適化

```typescript
const OptimizedKeyValueEditor: React.FC<Props> = ({ pairs, onChange }) => {
  // コールバック関数をメモ化
  const handleAddPair = useCallback(() => {
    const newPair = createEmptyPair();
    onChange([...pairs, newPair]);
  }, [pairs, onChange]);

  const handleUpdatePair = useCallback((id: string, field: string, value: any) => {
    onChange(pairs.map(pair =>
      pair.id === id ? { ...pair, [field]: value } : pair
    ));
  }, [pairs, onChange]);

  const handleRemovePair = useCallback((id: string) => {
    onChange(pairs.filter(pair => pair.id !== id));
  }, [pairs, onChange]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = pairs.findIndex(p => p.id === active.id);
    const newIndex = pairs.findIndex(p => p.id === over.id);

    onChange(arrayMove(pairs, oldIndex, newIndex));
  }, [pairs, onChange]);

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {/* エディター内容 */}
    </DndContext>
  );
};
```

### 8.2 大量データ対応

#### 仮想化（将来的改善）

```typescript
const VirtualizedKeyValueList: React.FC<Props> = ({ pairs, onUpdate }) => {
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(50);

  const visiblePairs = pairs.slice(startIndex, endIndex);

  const handleScroll = useCallback((scrollTop: number) => {
    const itemHeight = 40;
    const containerHeight = 400;
    const newStartIndex = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);

    setStartIndex(newStartIndex);
    setEndIndex(newStartIndex + visibleCount + 5); // バッファ
  }, []);

  return (
    <div className="virtual-list" onScroll={(e) => handleScroll(e.currentTarget.scrollTop)}>
      <div style={{ height: pairs.length * 40 }}>
        <div style={{ transform: `translateY(${startIndex * 40}px)` }}>
          {visiblePairs.map(pair => (
            <KeyValueRow key={pair.id} pair={pair} onUpdate={onUpdate} />
          ))}
        </div>
      </div>
    </div>
  );
};
```

#### データ構造最適化

```typescript
// Map使用での高速検索
const useOptimizedPairs = (initialPairs: KeyValuePair[]) => {
  const [pairsMap, setPairsMap] = useState(
    () => new Map(initialPairs.map((pair) => [pair.id, pair])),
  );
  const [pairOrder, setPairOrder] = useState(() => initialPairs.map((pair) => pair.id));

  const updatePair = useCallback((id: string, field: string, value: any) => {
    setPairsMap((prev) => {
      const newMap = new Map(prev);
      const pair = newMap.get(id);
      if (pair) {
        newMap.set(id, { ...pair, [field]: value });
      }
      return newMap;
    });
  }, []);

  const pairs = useMemo(
    () => pairOrder.map((id) => pairsMap.get(id)).filter(Boolean) as KeyValuePair[],
    [pairsMap, pairOrder],
  );

  return { pairs, updatePair, pairsMap, pairOrder };
};
```

---

## 9. テスト戦略

### 9.1 ユニットテスト

#### コンポーネントテスト

```typescript
describe('KeyValueRow', () => {
  const mockPair: KeyValuePair = {
    id: 'test-1',
    keyName: 'Content-Type',
    value: 'application/json',
    enabled: true
  };

  test('正しく表示される', () => {
    render(
      <KeyValueRow
        pair={mockPair}
        onUpdate={jest.fn()}
        onRemove={jest.fn()}
      />
    );

    expect(screen.getByDisplayValue('Content-Type')).toBeInTheDocument();
    expect(screen.getByDisplayValue('application/json')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  test('値の更新が正しく処理される', async () => {
    const mockUpdate = jest.fn();

    render(
      <KeyValueRow
        pair={mockPair}
        onUpdate={mockUpdate}
        onRemove={jest.fn()}
      />
    );

    const keyInput = screen.getByDisplayValue('Content-Type');
    await userEvent.clear(keyInput);
    await userEvent.type(keyInput, 'Authorization');

    expect(mockUpdate).toHaveBeenCalledWith('test-1', 'keyName', 'Authorization');
  });

  test('削除ボタンが機能する', async () => {
    const mockRemove = jest.fn();

    render(
      <KeyValueRow
        pair={mockPair}
        onUpdate={jest.fn()}
        onRemove={mockRemove}
      />
    );

    const deleteButton = screen.getByLabelText('Delete');
    await userEvent.click(deleteButton);

    expect(mockRemove).toHaveBeenCalledWith('test-1');
  });
});
```

#### フック・ユーティリティテスト

```typescript
describe('convertToJson', () => {
  test('有効なペアのみをJSONに変換する', () => {
    const pairs: KeyValuePair[] = [
      { id: '1', keyName: 'key1', value: 'value1', enabled: true },
      { id: '2', keyName: 'key2', value: 'value2', enabled: false },
      { id: '3', keyName: '', value: 'value3', enabled: true },
      { id: '4', keyName: 'key4', value: 'value4', enabled: true },
    ];

    const result = convertToJson(pairs);
    const parsed = JSON.parse(result);

    expect(parsed).toEqual({
      key1: 'value1',
      key4: 'value4',
    });
  });
});

describe('convertFromJson', () => {
  test('JSONオブジェクトをKey-Valueペアに変換する', () => {
    const json = '{"Authorization": "Bearer token", "Content-Type": "application/json"}';
    const result = convertFromJson(json);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      keyName: 'Authorization',
      value: 'Bearer token',
      enabled: true,
    });
  });

  test('不正なJSONは空配列を返す', () => {
    const invalidJson = '{invalid json}';
    const result = convertFromJson(invalidJson);

    expect(result).toEqual([]);
  });
});
```

### 9.2 インテグレーションテスト

#### エディター統合テスト

```typescript
describe('RequestEditorPanel統合', () => {
  test('タブ切り替えが正常に動作する', async () => {
    render(
      <RequestEditorPanel
        method="POST"
        url=""
        headers={[]}
        onMethodChange={jest.fn()}
        onUrlChange={jest.fn()}
        onAddHeader={jest.fn()}
      />
    );

    // デフォルトでHeadersタブが表示
    expect(screen.getByText('Headers')).toHaveClass('active');

    // Bodyタブに切り替え
    await userEvent.click(screen.getByText('Body'));
    expect(screen.getByText('Body')).toHaveClass('active');

    // Body編集コンテンツが表示される
    expect(screen.getByText('Add new pair')).toBeInTheDocument();
  });

  test('HTTPメソッド変更でBody表示が制御される', async () => {
    const { rerender } = render(
      <RequestEditorPanel method="POST" /* other props */ />
    );

    // POSTメソッドではBodyが有効
    await userEvent.click(screen.getByText('Body'));
    expect(screen.getByTestId('body-editor')).not.toHaveClass('disabled');

    // GETメソッドに変更
    rerender(<RequestEditorPanel method="GET" /* other props */ />);

    expect(screen.getByTestId('body-editor')).toHaveClass('disabled');
  });
});
```

### 9.3 E2Eテスト

#### ユーザーワークフロー

```typescript
test('リクエスト作成の完全なフロー', async ({ page }) => {
  await page.goto('/');

  // 新規リクエスト作成
  await page.click('[data-testid="new-request"]');

  // リクエスト名設定
  await page.fill('[data-testid="request-name"]', 'Test API Request');

  // HTTPメソッド設定
  await page.selectOption('[data-testid="method-select"]', 'POST');

  // URL設定
  await page.fill('[data-testid="url-input"]', 'https://api.example.com/users');

  // ヘッダー追加
  await page.click('[data-testid="tab-headers"]');
  await page.click('[data-testid="add-header"]');
  await page.fill('[data-testid="header-key-0"]', 'Content-Type');
  await page.fill('[data-testid="header-value-0"]', 'application/json');

  // ボディ設定
  await page.click('[data-testid="tab-body"]');
  await page.click('[data-testid="add-body-pair"]');
  await page.fill('[data-testid="body-key-0"]', 'name');
  await page.fill('[data-testid="body-value-0"]', 'John Doe');

  // パラメータ設定
  await page.click('[data-testid="tab-params"]');
  await page.click('[data-testid="add-param"]');
  await page.fill('[data-testid="param-key-0"]', 'format');
  await page.fill('[data-testid="param-value-0"]', 'json');

  // リクエスト保存
  await page.click('[data-testid="save-request"]');

  // 保存成功の確認
  await expect(page.locator('[data-testid="save-toast"]')).toBeVisible();
});
```

---

## 10. 拡張性設計

### 10.1 エディター機能拡張

#### カスタムエディター追加

```typescript
interface CustomEditorProps {
  type: 'auth' | 'scripts' | 'tests';
  data: any;
  onChange: (data: any) => void;
}

const CustomEditorRegistry = new Map<string, React.ComponentType<CustomEditorProps>>();

// 認証エディター
const AuthEditor: React.FC<CustomEditorProps> = ({ data, onChange }) => {
  const [authType, setAuthType] = useState<'none' | 'basic' | 'bearer' | 'oauth'>('none');

  return (
    <div className="auth-editor">
      <SelectBox value={authType} onChange={setAuthType}>
        <option value="none">No Auth</option>
        <option value="basic">Basic Auth</option>
        <option value="bearer">Bearer Token</option>
        <option value="oauth">OAuth 2.0</option>
      </SelectBox>

      {authType === 'basic' && <BasicAuthForm data={data} onChange={onChange} />}
      {authType === 'bearer' && <BearerTokenForm data={data} onChange={onChange} />}
      {authType === 'oauth' && <OAuthForm data={data} onChange={onChange} />}
    </div>
  );
};

// エディター登録
CustomEditorRegistry.set('auth', AuthEditor);
```

#### プラグインアーキテクチャ

```typescript
interface EditorPlugin {
  id: string;
  name: string;
  tabName: string;
  component: React.ComponentType<CustomEditorProps>;
  validate?: (data: any) => ValidationResult;
  serialize?: (data: any) => string;
  deserialize?: (serialized: string) => any;
}

const useEditorPlugins = () => {
  const [plugins, setPlugins] = useState<EditorPlugin[]>([]);

  const registerPlugin = (plugin: EditorPlugin) => {
    setPlugins(prev => [...prev, plugin]);
  };

  const unregisterPlugin = (id: string) => {
    setPlugins(prev => prev.filter(p => p.id !== id));
  };

  return { plugins, registerPlugin, unregisterPlugin };
};

// 拡張可能なエディターパネル
const ExtensibleEditorPanel: React.FC = () => {
  const { plugins } = useEditorPlugins();
  const [activeTab, setActiveTab] = useState('headers');

  const allTabs = [
    { id: 'headers', name: 'Headers', component: HeadersEditor },
    { id: 'body', name: 'Body', component: BodyEditor },
    { id: 'params', name: 'Params', component: ParamsEditor },
    ...plugins.map(plugin => ({
      id: plugin.id,
      name: plugin.tabName,
      component: plugin.component
    }))
  ];

  return (
    <div className="extensible-editor">
      <TabNavigation tabs={allTabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <TabContent tabs={allTabs} activeTab={activeTab} />
    </div>
  );
};
```

### 10.2 高度な編集機能

#### スニペット機能

```typescript
interface EditorSnippet {
  id: string;
  name: string;
  description: string;
  category: 'headers' | 'body' | 'params';
  template: Record<string, any>;
  variables?: string[];
}

const useSnippets = () => {
  const [snippets, setSnippets] = useState<EditorSnippet[]>([]);

  const insertSnippet = (snippet: EditorSnippet, variables: Record<string, string> = {}) => {
    let template = JSON.stringify(snippet.template);

    // 変数置換
    Object.entries(variables).forEach(([key, value]) => {
      template = template.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
    });

    return JSON.parse(template);
  };

  return { snippets, insertSnippet };
};

// プリセットスニペット
const DEFAULT_SNIPPETS: EditorSnippet[] = [
  {
    id: 'json-content-type',
    name: 'JSON Content-Type',
    description: 'Add JSON content type header',
    category: 'headers',
    template: {
      'Content-Type': 'application/json',
    },
  },
  {
    id: 'auth-bearer',
    name: 'Bearer Authorization',
    description: 'Add Bearer token authorization',
    category: 'headers',
    template: {
      Authorization: 'Bearer ${token}',
    },
    variables: ['token'],
  },
  {
    id: 'user-object',
    name: 'User Object',
    description: 'Standard user object template',
    category: 'body',
    template: {
      name: '${name}',
      email: '${email}',
      age: '${age}',
    },
    variables: ['name', 'email', 'age'],
  },
];
```

#### 履歴・比較機能

```typescript
interface EditorHistory {
  id: string;
  timestamp: number;
  data: RequestData;
  description: string;
}

const useEditorHistory = () => {
  const [history, setHistory] = useState<EditorHistory[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const saveState = (data: RequestData, description: string) => {
    const historyEntry: EditorHistory = {
      id: generateId(),
      timestamp: Date.now(),
      data: deepClone(data),
      description,
    };

    setHistory((prev) => [...prev.slice(0, currentIndex + 1), historyEntry]);
    setCurrentIndex((prev) => prev + 1);
  };

  const undo = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      return history[currentIndex - 1].data;
    }
    return null;
  };

  const redo = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return history[currentIndex + 1].data;
    }
    return null;
  };

  const compare = (historyId1: string, historyId2: string) => {
    const entry1 = history.find((h) => h.id === historyId1);
    const entry2 = history.find((h) => h.id === historyId2);

    if (!entry1 || !entry2) return null;

    return {
      differences: calculateDifferences(entry1.data, entry2.data),
      entry1,
      entry2,
    };
  };

  return {
    history,
    saveState,
    undo,
    redo,
    compare,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
  };
};
```

### 10.3 コラボレーション機能（将来構想）

#### リアルタイム編集

```typescript
interface CollaborativeEditor {
  sessionId: string;
  users: CollaborativeUser[];
  changes: EditorChange[];
}

interface CollaborativeUser {
  id: string;
  name: string;
  color: string;
  cursor: { line: number; column: number } | null;
}

interface EditorChange {
  id: string;
  userId: string;
  timestamp: number;
  operation: 'insert' | 'delete' | 'update';
  path: string; // JSONPath形式
  oldValue: any;
  newValue: any;
}

const useCollaborativeEditor = (sessionId: string) => {
  const [session, setSession] = useState<CollaborativeEditor | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const applyChange = (change: EditorChange) => {
    // Operational Transform アルゴリズムを使用して変更を適用
    const transformedChange = transformChange(change, session?.changes || []);

    setSession((prev) =>
      prev
        ? {
            ...prev,
            changes: [...prev.changes, transformedChange],
          }
        : null,
    );
  };

  const sendChange = (change: Omit<EditorChange, 'id' | 'timestamp'>) => {
    const fullChange: EditorChange = {
      ...change,
      id: generateId(),
      timestamp: Date.now(),
    };

    socket?.send(JSON.stringify({ type: 'change', data: fullChange }));
    applyChange(fullChange);
  };

  return { session, sendChange };
};
```

---

この詳細設計書により、エディター機能の実装詳細、アーキテクチャ、今後の拡張方針を体系的に理解できます。開発者の参考資料、新機能追加時の設計指針、コードレビューの基準として活用できます。
