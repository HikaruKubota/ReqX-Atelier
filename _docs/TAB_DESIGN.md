# タブ機能 詳細設計書

## 1. 概要

タブ機能は、複数のAPIリクエストを同時に編集・管理するためのマルチタブインターフェースです。ブラウザのタブと同様の操作感で、リクエストの切り替え、並び替え、新規作成、削除を提供します。

### 主要特徴

- **マルチタブ対応**: 同時に複数のリクエストを開いて編集可能
- **ドラッグ&ドロップ**: タブの順序を直感的に変更
- **キーボードショートカット**: 効率的なタブ操作
- **状態保持**: タブごとにリクエスト・レスポンス状態を個別管理
- **自動タブ管理**: 適切なタブの自動選択・作成
- **視覚的フィードバック**: アクティブ状態・ホバー状態の明確な表示

---

## 2. データ構造

### 2.1 型定義

#### TabState

```typescript
interface TabState {
  tabId: string; // 一意のタブ識別子
  requestId: string | null; // 関連するSavedRequestのID（null=新規タブ）
}
```

#### Tab表示情報（派生データ）

```typescript
interface TabDisplayInfo {
  tabId: string;
  name: string; // 表示名（リクエスト名または"Untitled"）
  method?: string; // HTTPメソッド（保存済みリクエストの場合）
  isUnsaved: boolean; // 未保存フラグ
  hasChanges: boolean; // 変更フラグ
}
```

#### TabsHookReturn

```typescript
interface TabsHookReturn {
  tabs: TabState[]; // タブ配列
  activeTabId: string | null; // アクティブタブID
  openTab: (request?: SavedRequest) => void; // 新規タブ作成
  closeTab: (tabId: string) => void; // タブ削除
  switchTab: (tabId: string) => void; // タブ切り替え
  updateTab: (tabId: string, updates: Partial<TabState>) => void; // タブ更新
  nextTab: () => void; // 次のタブに移動
  prevTab: () => void; // 前のタブに移動
  moveActiveTabLeft: () => void; // アクティブタブを左に移動
  moveActiveTabRight: () => void; // アクティブタブを右に移動
  reorderTabs: (activeId: string, overId: string) => void; // ドラッグ&ドロップ並び替え
  getActiveTab: () => TabState | null; // アクティブタブ取得
}
```

### 2.2 データフロー

```
User Action → useTabs Hook → TabState[] → TabBar Component → UI Display
     ↓                                           ↓
Keyboard Shortcuts                        Tab Interactions
     ↓                                           ↓
useKeyboardShortcuts → Tab Navigation → State Update
```

---

## 3. 核心アルゴリズム

### 3.1 タブID生成

```typescript
const generateTabId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `tab-${timestamp}-${randomPart}`;
};
```

**特徴**:

- タイムスタンプ + ランダム文字列で一意性を保証
- 36進数エンコーディングで短縮
- プレフィックス`tab-`で識別しやすさを向上

### 3.2 タブ切り替えロジック

#### アクティブタブ決定

```typescript
const determineNextActiveTab = (tabs: TabState[], closingTabIndex: number): string | null => {
  if (tabs.length <= 1) return null;

  // 削除されるタブより右にタブがある場合、同じインデックスの次のタブ
  if (closingTabIndex < tabs.length - 1) {
    return tabs[closingTabIndex + 1].tabId;
  }

  // 右にタブがない場合、左のタブ
  if (closingTabIndex > 0) {
    return tabs[closingTabIndex - 1].tabId;
  }

  return null;
};
```

#### 循環的タブ移動

```typescript
const nextTab = () => {
  if (tabs.length === 0) return;

  const currentIndex = tabs.findIndex((tab) => tab.tabId === activeTabId);
  const nextIndex = (currentIndex + 1) % tabs.length;
  switchTab(tabs[nextIndex].tabId);
};

const prevTab = () => {
  if (tabs.length === 0) return;

  const currentIndex = tabs.findIndex((tab) => tab.tabId === activeTabId);
  const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
  switchTab(tabs[prevIndex].tabId);
};
```

### 3.3 タブ並び替えアルゴリズム

#### ドラッグ&ドロップ処理

```typescript
const reorderTabs = (activeId: string, overId: string) => {
  const oldIndex = tabs.findIndex((tab) => tab.tabId === activeId);
  const newIndex = tabs.findIndex((tab) => tab.tabId === overId);

  if (oldIndex === -1 || newIndex === -1) return;

  const newTabs = arrayMove(tabs, oldIndex, newIndex);
  setTabs(newTabs);
};

// arrayMove関数（@dnd-kit/sortable提供）
const arrayMove = <T>(array: T[], from: number, to: number): T[] => {
  const newArray = [...array];
  const item = newArray.splice(from, 1)[0];
  newArray.splice(to, 0, item);
  return newArray;
};
```

#### キーボードによる移動

```typescript
const moveActiveTabLeft = () => {
  const currentIndex = tabs.findIndex((tab) => tab.tabId === activeTabId);
  if (currentIndex > 0) {
    const newTabs = arrayMove(tabs, currentIndex, currentIndex - 1);
    setTabs(newTabs);
  }
};

const moveActiveTabRight = () => {
  const currentIndex = tabs.findIndex((tab) => tab.tabId === activeTabId);
  if (currentIndex < tabs.length - 1) {
    const newTabs = arrayMove(tabs, currentIndex, currentIndex + 1);
    setTabs(newTabs);
  }
};
```

---

## 4. 状態管理

### 4.1 ローカル状態管理

#### useState使用理由

- **軽量性**: タブ状態は一時的なUIステート
- **永続化不要**: アプリ再起動時にタブをリセットしたい
- **シンプルさ**: Zustandの複雑さが不要
- **パフォーマンス**: ローカル状態で十分高速

#### 状態の初期化

```typescript
const useTabs = () => {
  const [tabs, setTabs] = useState<TabState[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  // 初回のみ新規タブを作成
  useEffect(() => {
    if (tabs.length === 0) {
      openTab(); // 新規タブ作成
    }
  }, []);

  // ...
};
```

### 4.2 状態の同期

#### リクエストデータとの同期

```typescript
// App.tsxでの使用例
useEffect(() => {
  const tab = tabs.getActiveTab();
  if (!tab) {
    resetEditor();
    setRequestNameForSave('Untitled Request');
    setActiveRequestId(null);
    resetApiResponse();
    return;
  }

  if (tab.requestId) {
    // 保存済みリクエストの読み込み
    const req = savedRequests.find((r) => r.id === tab.requestId);
    if (req) {
      loadRequestIntoEditor(req);
      setRequestNameForSave(req.name);
      setActiveRequestId(req.id);
    }
  } else {
    // 新規タブの初期化
    resetEditor();
    setRequestNameForSave('Untitled Request');
    setActiveRequestId(null);
  }
}, [tabs.activeTabId, savedRequests]);
```

#### レスポンス状態の保持

```typescript
// タブごとのレスポンス状態管理
const [tabResponses, setTabResponses] = useState<
  Record<
    string,
    {
      response: ApiResult | null;
      error: ApiError | null;
      responseTime: number | null;
    }
  >
>({});

// アクティブタブ変更時のレスポンス状態復元
useEffect(() => {
  const id = tabs.activeTabId;
  if (!id) {
    resetApiResponse();
    return;
  }

  const saved = tabResponses[id];
  if (saved) {
    setApiResponseState(saved);
  } else {
    resetApiResponse();
  }
}, [tabs.activeTabId]);
```

---

## 5. UI/UX設計

### 5.1 タブバーレイアウト

#### レスポンシブ設計

```typescript
// タブの最大幅制約
const TAB_MAX_WIDTH = '200px';
const TAB_MIN_WIDTH = '120px';

// タブが多い場合のスクロール対応
const tabBarStyle = {
  display: 'flex',
  overflowX: 'auto',
  scrollbarWidth: 'thin',
  '&::-webkit-scrollbar': {
    height: '4px',
  },
};
```

#### タブの表示優先度

1. **アクティブタブ**: 常に表示
2. **変更があるタブ**: 優先的に表示
3. **古いタブ**: 必要に応じて折りたたみ

### 5.2 ビジュアルフィードバック

#### タブ状態の視覚化

```typescript
const getTabStyles = (tab: TabState, isActive: boolean) => ({
  // ベーススタイル
  padding: '8px 16px',
  borderRadius: '8px 8px 0 0',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  // アクティブ状態
  backgroundColor: isActive ? 'var(--color-background)' : 'var(--color-secondary)',
  borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',

  // ホバー状態
  '&:hover': {
    backgroundColor: isActive ? 'var(--color-background)' : 'var(--color-background-hover)',
  },

  // ドラッグ状態
  opacity: isDragging ? 0.6 : 1,
});
```

#### 未保存状態の表示

```typescript
const TabTitle: React.FC<{ tab: TabState }> = ({ tab }) => {
  const request = savedRequests.find(r => r.id === tab.requestId);
  const hasChanges = checkIfTabHasChanges(tab);

  return (
    <span className="tab-title">
      {request?.name || 'Untitled Request'}
      {hasChanges && <span className="unsaved-indicator">●</span>}
    </span>
  );
};
```

### 5.3 インタラクション設計

#### クリック処理

```typescript
const handleTabClick = (tabId: string, event: React.MouseEvent) => {
  event.preventDefault();

  if (event.button === 0) {
    // 左クリック: タブ切り替え
    switchTab(tabId);
  } else if (event.button === 1) {
    // 中クリック: タブを閉じる
    closeTab(tabId);
  }
};
```

#### 閉じるボタン

```typescript
const CloseButton: React.FC<{ tabId: string }> = ({ tabId }) => (
  <button
    className="tab-close-button"
    onClick={(e) => {
      e.stopPropagation(); // タブクリックイベントを防止
      closeTab(tabId);
    }}
    onMouseDown={(e) => e.stopPropagation()} // ドラッグ開始を防止
  >
    ×
  </button>
);
```

#### ドラッグハンドル

```typescript
const TabItem: React.FC<{ tab: TabState }> = ({ tab }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: tab.tabId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners} // ドラッグ用のイベントリスナー
      className="tab-item"
    >
      {/* タブ内容 */}
    </div>
  );
};
```

---

## 6. キーボードショートカット

### 6.1 サポートされるショートカット

#### 基本操作

```typescript
const TAB_SHORTCUTS = {
  NEW_TAB: 'Cmd/Ctrl + N',
  CLOSE_TAB: 'Cmd/Ctrl + W',
  NEXT_TAB: 'Cmd/Ctrl + Alt + →',
  PREV_TAB: 'Cmd/Ctrl + Alt + ←',
  MOVE_TAB_LEFT: 'Cmd/Ctrl + Shift + ←',
  MOVE_TAB_RIGHT: 'Cmd/Ctrl + Shift + →',
} as const;
```

#### ショートカット実装

```typescript
const useKeyboardShortcuts = ({ onNew, onNextTab, onPrevTab, onCloseTab }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;

      if (!cmdOrCtrl) return;

      switch (event.key) {
        case 'n':
        case 'N':
          event.preventDefault();
          onNew();
          break;

        case 'w':
        case 'W':
          if (!event.shiftKey) {
            event.preventDefault();
            onCloseTab();
          }
          break;

        case 'ArrowRight':
          if (event.altKey && !event.shiftKey) {
            event.preventDefault();
            onNextTab();
          }
          break;

        case 'ArrowLeft':
          if (event.altKey && !event.shiftKey) {
            event.preventDefault();
            onPrevTab();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onNew, onNextTab, onPrevTab, onCloseTab]);
};
```

### 6.2 ショートカットの競合回避

#### システムショートカットとの競合

```typescript
// Cmd/Ctrl + Shift + Arrow は OS のワークスペース切り替えと競合するためスキップ
if (event.shiftKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
  return; // 処理しない
}
```

#### ブラウザショートカットとの競合

```typescript
// Electron環境での特別処理
if (process.env.NODE_ENV === 'development') {
  // 開発時のブラウザショートカットを無効化
  event.preventDefault();
}
```

---

## 7. パフォーマンス最適化

### 7.1 レンダリング最適化

#### React.memo使用

```typescript
const TabItem = React.memo<TabItemProps>(
  ({ tab, isActive, onSelect, onClose }) => {
    // タブの内容・状態が変更された場合のみ再レンダリング
  },
  (prevProps, nextProps) => {
    return (
      prevProps.tab.tabId === nextProps.tab.tabId &&
      prevProps.tab.requestId === nextProps.tab.requestId &&
      prevProps.isActive === nextProps.isActive
    );
  },
);
```

#### useCallback使用

```typescript
const TabBar: React.FC<TabBarProps> = ({ tabs, activeTabId, onSelect, onClose }) => {
  const handleSelect = useCallback(
    (tabId: string) => {
      onSelect(tabId);
    },
    [onSelect],
  );

  const handleClose = useCallback(
    (tabId: string) => {
      onClose(tabId);
    },
    [onClose],
  );

  const handleReorder = useCallback(
    (activeId: string, overId: string) => {
      onReorder(activeId, overId);
    },
    [onReorder],
  );

  // ...
};
```

### 7.2 状態更新の最適化

#### バッチ更新

```typescript
const openTabWithRequest = (request: SavedRequest) => {
  // 複数の状態を一度に更新
  const newTabId = generateTabId();

  setTabs((prev) => [...prev, { tabId: newTabId, requestId: request.id }]);
  setActiveTabId(newTabId);

  // React 18の自動バッチングを活用
};
```

#### 不要な状態更新の回避

```typescript
const switchTab = useCallback((tabId: string) => {
  setActiveTabId((prev) => {
    if (prev === tabId) return prev; // 同じタブの場合は更新しない
    return tabId;
  });
}, []);
```

### 7.3 メモリ管理

#### タブ閉じる時のクリーンアップ

```typescript
const closeTab = useCallback(
  (tabId: string) => {
    // 1. タブを配列から削除
    setTabs((prev) => prev.filter((tab) => tab.tabId !== tabId));

    // 2. 関連するレスポンス状態を削除
    setTabResponses((prev) => {
      const newState = { ...prev };
      delete newState[tabId];
      return newState;
    });

    // 3. アクティブタブの調整
    if (activeTabId === tabId) {
      const remainingTabs = tabs.filter((tab) => tab.tabId !== tabId);
      if (remainingTabs.length > 0) {
        const currentIndex = tabs.findIndex((tab) => tab.tabId === tabId);
        const nextTab = determineNextActiveTab(tabs, currentIndex);
        setActiveTabId(nextTab);
      } else {
        setActiveTabId(null);
      }
    }
  },
  [tabs, activeTabId],
);
```

---

## 8. エラーハンドリング

### 8.1 想定されるエラーシナリオ

#### 無効なタブID

```typescript
const safeTabOperation = (tabId: string, operation: () => void) => {
  const tabExists = tabs.some((tab) => tab.tabId === tabId);

  if (!tabExists) {
    console.warn(`Tab not found: ${tabId}`);
    return;
  }

  try {
    operation();
  } catch (error) {
    console.error('Tab operation failed:', error);
    // フォールバック処理
  }
};
```

#### リクエストデータの不整合

```typescript
const validateTabState = (tab: TabState): boolean => {
  // 1. requestIdが有効かチェック
  if (tab.requestId && !savedRequests.find((r) => r.id === tab.requestId)) {
    console.warn(`Invalid requestId in tab: ${tab.requestId}`);
    return false;
  }

  // 2. tabIdの一意性チェック
  const duplicates = tabs.filter((t) => t.tabId === tab.tabId);
  if (duplicates.length > 1) {
    console.error(`Duplicate tabId found: ${tab.tabId}`);
    return false;
  }

  return true;
};
```

### 8.2 回復戦略

#### 破損したタブデータの修復

```typescript
const repairTabData = () => {
  const validTabs = tabs.filter((tab) => {
    // 1. 基本的なデータ検証
    if (!tab.tabId || typeof tab.tabId !== 'string') {
      return false;
    }

    // 2. requestIdの存在確認（nullは有効）
    if (tab.requestId && !savedRequests.find((r) => r.id === tab.requestId)) {
      // 破損したrequestIdをnullにリセット
      tab.requestId = null;
    }

    return true;
  });

  if (validTabs.length !== tabs.length) {
    console.log('Repaired tab data');
    setTabs(validTabs);

    // アクティブタブが削除された場合の調整
    if (activeTabId && !validTabs.find((t) => t.tabId === activeTabId)) {
      setActiveTabId(validTabs.length > 0 ? validTabs[0].tabId : null);
    }
  }
};
```

#### グレースフルデグラデーション

```typescript
const safeCloseTab = (tabId: string) => {
  try {
    closeTab(tabId);
  } catch (error) {
    console.error('Failed to close tab normally:', error);

    // フォールバック: 強制的にタブを削除
    setTabs((prev) => prev.filter((tab) => tab.tabId !== tabId));

    if (activeTabId === tabId) {
      // 適当なタブをアクティブにする
      const remainingTabs = tabs.filter((tab) => tab.tabId !== tabId);
      setActiveTabId(remainingTabs.length > 0 ? remainingTabs[0].tabId : null);
    }

    // ユーザーに通知
    showErrorToast('タブの削除中にエラーが発生しました。');
  }
};
```

---

## 9. テスト戦略

### 9.1 ユニットテスト

#### タブ操作のテスト

```typescript
describe('useTabs', () => {
  test('新規タブが正しく作成される', () => {
    const { result } = renderHook(() => useTabs());

    act(() => {
      result.current.openTab();
    });

    expect(result.current.tabs).toHaveLength(1);
    expect(result.current.tabs[0].requestId).toBeNull();
    expect(result.current.activeTabId).toBe(result.current.tabs[0].tabId);
  });

  test('保存済みリクエストでタブが作成される', () => {
    const mockRequest: SavedRequest = {
      id: 'req-1',
      name: 'Test Request',
      method: 'GET',
      url: 'https://api.example.com',
    };

    const { result } = renderHook(() => useTabs());

    act(() => {
      result.current.openTab(mockRequest);
    });

    expect(result.current.tabs[0].requestId).toBe('req-1');
  });

  test('タブが正しく削除される', () => {
    const { result } = renderHook(() => useTabs());

    // 2つのタブを作成
    act(() => {
      result.current.openTab();
      result.current.openTab();
    });

    const firstTabId = result.current.tabs[0].tabId;

    // 最初のタブを削除
    act(() => {
      result.current.closeTab(firstTabId);
    });

    expect(result.current.tabs).toHaveLength(1);
    expect(result.current.tabs.find((t) => t.tabId === firstTabId)).toBeUndefined();
  });
});
```

#### 並び替えロジックのテスト

```typescript
describe('タブ並び替え', () => {
  test('ドラッグ&ドロップで順序が変更される', () => {
    const { result } = renderHook(() => useTabs());

    // 3つのタブを作成
    act(() => {
      result.current.openTab();
      result.current.openTab();
      result.current.openTab();
    });

    const [tab1, tab2, tab3] = result.current.tabs;

    // 最初のタブを最後に移動
    act(() => {
      result.current.reorderTabs(tab1.tabId, tab3.tabId);
    });

    expect(result.current.tabs[0].tabId).toBe(tab2.tabId);
    expect(result.current.tabs[1].tabId).toBe(tab3.tabId);
    expect(result.current.tabs[2].tabId).toBe(tab1.tabId);
  });
});
```

### 9.2 インテグレーションテスト

#### タブとリクエストエディターの連携

```typescript
describe('タブとエディターの連携', () => {
  test('タブ切り替え時にリクエストデータが正しく読み込まれる', () => {
    const mockRequests = [
      { id: 'req-1', name: 'Request 1', method: 'GET', url: 'https://api1.com' },
      { id: 'req-2', name: 'Request 2', method: 'POST', url: 'https://api2.com' }
    ];

    render(
      <TestProvider>
        <App />
      </TestProvider>
    );

    // 2つのリクエストでタブを開く
    mockRequests.forEach(req => {
      fireEvent.click(screen.getByText(req.name));
    });

    // 最初のタブに切り替え
    fireEvent.click(screen.getByText('Request 1'));
    expect(screen.getByDisplayValue('https://api1.com')).toBeInTheDocument();

    // 2番目のタブに切り替え
    fireEvent.click(screen.getByText('Request 2'));
    expect(screen.getByDisplayValue('https://api2.com')).toBeInTheDocument();
  });
});
```

### 9.3 E2Eテスト

#### ユーザーワークフロー

```typescript
test('タブ操作の完全なワークフロー', async ({ page }) => {
  await page.goto('/');

  // 1. 新規タブ作成
  await page.keyboard.press('Meta+N'); // Mac
  await expect(page.locator('[data-testid="tab"]')).toHaveCount(2);

  // 2. タブ名の確認
  await expect(page.locator('[data-testid="tab"]:last-child')).toContainText('Untitled Request');

  // 3. リクエストを設定して保存
  await page.fill('[data-testid="url-input"]', 'https://api.example.com');
  await page.keyboard.press('Meta+S');

  // 4. タブ切り替え
  await page.keyboard.press('Meta+Alt+ArrowLeft');
  await expect(page.locator('[data-testid="tab"]:first-child')).toHaveClass(/active/);

  // 5. タブを閉じる
  await page.keyboard.press('Meta+W');
  await expect(page.locator('[data-testid="tab"]')).toHaveCount(1);
});
```

---

## 10. 拡張性設計

### 10.1 タブ機能の拡張案

#### タブグループ機能

```typescript
interface TabGroup {
  id: string;
  name: string;
  color: string;
  tabIds: string[];
}

interface ExtendedTabState extends TabState {
  groupId?: string;
  color?: string;
  pinned?: boolean;
}
```

#### タブ履歴機能

```typescript
interface TabHistory {
  tabId: string;
  timestamp: number;
  requestSnapshot: SavedRequest;
  responseSnapshot?: ApiResult;
}

const useTabHistory = () => {
  const [history, setHistory] = useState<TabHistory[]>([]);

  const saveTabSnapshot = (tab: TabState) => {
    // タブの現在状態をスナップショットとして保存
  };

  const restoreTabFromHistory = (historyId: string) => {
    // 履歴からタブを復元
  };
};
```

#### タブ分割表示

```typescript
interface SplitTabLayout {
  type: 'horizontal' | 'vertical';
  panes: Array<{
    tabId: string;
    size: number; // パーセンテージ
  }>;
}

const useSplitTabs = () => {
  const [layout, setLayout] = useState<SplitTabLayout | null>(null);

  const splitTab = (tabId: string, direction: 'horizontal' | 'vertical') => {
    // タブを分割表示
  };

  const mergeTab = (tabId: string) => {
    // 分割を解除
  };
};
```

### 10.2 パフォーマンス拡張

#### 仮想化タブリスト

```typescript
const VirtualizedTabList: React.FC<{ tabs: TabState[] }> = ({ tabs }) => {
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(10);

  const visibleTabs = tabs.slice(startIndex, endIndex);

  // スクロール位置に応じて表示範囲を調整
  const handleScroll = (scrollLeft: number) => {
    const tabWidth = 150;
    const newStartIndex = Math.floor(scrollLeft / tabWidth);
    setStartIndex(newStartIndex);
    setEndIndex(newStartIndex + 10);
  };

  return (
    <div onScroll={(e) => handleScroll(e.currentTarget.scrollLeft)}>
      {visibleTabs.map(tab => (
        <TabItem key={tab.tabId} tab={tab} />
      ))}
    </div>
  );
};
```

#### タブの遅延読み込み

```typescript
const useLazyTabContent = (tabId: string) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [content, setContent] = useState(null);

  useEffect(() => {
    // タブがアクティブになったときのみコンテンツを読み込み
    if (isActive && !isLoaded) {
      loadTabContent(tabId).then(setContent);
      setIsLoaded(true);
    }
  }, [isActive, isLoaded, tabId]);

  return { content, isLoaded };
};
```

### 10.3 アクセシビリティ拡張

#### ARIA属性の追加

```typescript
const AccessibleTabItem: React.FC<TabItemProps> = ({ tab, isActive }) => (
  <div
    role="tab"
    aria-selected={isActive}
    aria-controls={`tabpanel-${tab.tabId}`}
    id={`tab-${tab.tabId}`}
    tabIndex={isActive ? 0 : -1}
  >
    {/* タブ内容 */}
  </div>
);

const AccessibleTabPanel: React.FC<{ tabId: string }> = ({ tabId, children }) => (
  <div
    role="tabpanel"
    aria-labelledby={`tab-${tabId}`}
    id={`tabpanel-${tabId}`}
  >
    {children}
  </div>
);
```

#### キーボードナビゲーション拡張

```typescript
const useAdvancedKeyboardNavigation = () => {
  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'Home':
        if (event.ctrlKey) {
          switchTab(tabs[0].tabId); // 最初のタブ
        }
        break;
      case 'End':
        if (event.ctrlKey) {
          switchTab(tabs[tabs.length - 1].tabId); // 最後のタブ
        }
        break;
      case 'Delete':
        if (event.ctrlKey) {
          closeTab(activeTabId); // アクティブタブを閉じる
        }
        break;
    }
  };

  // ...
};
```

---

この詳細設計書により、タブ機能の実装詳細、アーキテクチャ、今後の拡張方針を体系的に理解できます。開発者の参考資料、新機能追加時の設計指針、コードレビューの基準として活用できます。
