# フォルダ機能 詳細設計書

## 1. 概要

フォルダ機能は、APIリクエストを階層構造で整理・管理するための機能です。無制限の階層フォルダーの作成、ドラッグ&ドロップによる移動、コンテキストメニューによる操作など、モダンなファイルマネージャーに期待される機能を提供します。

### 主要特徴

- **無制限階層**: 親子関係による階層構造
- **ドラッグ&ドロップ**: フォルダー・リクエストの直感的な移動
- **コンテキストメニュー**: 右クリックによる操作メニュー
- **インライン編集**: フォルダー名の直接編集
- **再帰的操作**: フォルダー削除・コピーで子要素も含めて処理
- **永続化**: LocalStorageへの自動保存

---

## 2. データ構造

### 2.1 型定義

#### SavedFolder

```typescript
interface SavedFolder {
  id: string; // 一意識別子
  name: string; // フォルダー名
  parentFolderId: string | null; // 親フォルダーID（null=ルート）
  requestIds: string[]; // 含まれるリクエストIDリスト
  subFolderIds: string[]; // 子フォルダーIDリスト
}
```

#### TreeNode（React-Arborist用）

```typescript
interface TreeNode {
  id: string; // ノードID
  name: string; // 表示名
  children?: TreeNode[]; // 子ノード（フォルダーのみ）
  type: 'folder' | 'request'; // ノードタイプ
  data?: SavedRequest | SavedFolder; // 元データ
}
```

### 2.2 データフロー

```
SavedFolder[] → buildTree() → TreeNode[] → React-Arborist → UI表示
     ↑                                                         ↓
LocalStorage ←─ Zustand Store ←─ Actions ←─ User Interactions
```

---

## 3. 核心アルゴリズム

### 3.1 階層ツリー構築

#### buildTree関数

```typescript
const buildTree = (
  folders: SavedFolder[],
  requests: SavedRequest[],
  parentId: string | null = null,
): TreeNode[] => {
  // 1. 指定された親の子フォルダーを取得
  const childFolders = folders
    .filter((f) => f.parentFolderId === parentId)
    .sort((a, b) => a.name.localeCompare(b.name));

  // 2. 指定された親のリクエストを取得
  const childRequests = parentId
    ? requests.filter((r) => folders.find((f) => f.id === parentId)?.requestIds.includes(r.id))
    : requests.filter((r) => !folderRequestIds.has(r.id));

  // 3. フォルダーノードを再帰的に構築
  const folderNodes: TreeNode[] = childFolders.map((folder) => ({
    id: folder.id,
    name: folder.name,
    type: 'folder',
    data: folder,
    children: buildTree(folders, requests, folder.id), // 再帰呼び出し
  }));

  // 4. リクエストノードを構築
  const requestNodes: TreeNode[] = childRequests
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((request) => ({
      id: request.id,
      name: request.name,
      type: 'request',
      data: request,
    }));

  // 5. フォルダー優先でマージして返却
  return [...folderNodes, ...requestNodes];
};
```

**計算量**: O(n²) - nはフォルダー数
**最適化案**: フォルダーの親子関係をMapで管理することでO(n)に改善可能

### 3.2 循環参照検出

#### isDescendant関数

```typescript
const isDescendant = (
  ancestorId: string | null,
  descendantId: string,
  folders: SavedFolder[],
): boolean => {
  if (!ancestorId) return false;

  const folder = folders.find((f) => f.id === descendantId);
  if (!folder || !folder.parentFolderId) return false;

  if (folder.parentFolderId === ancestorId) return true;

  return isDescendant(ancestorId, folder.parentFolderId, folders);
};
```

**用途**: フォルダー移動時の循環参照防止
**計算量**: O(d) - dは階層の深さ

---

## 4. CRUD操作

### 4.1 作成（Create）

#### フォルダー作成

```typescript
const addFolder = (folder: Omit<SavedFolder, 'id'>) => {
  // 1. 一意IDを生成
  const newId = `folder-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  // 2. フォルダーオブジェクトを構築
  const newFolder: SavedFolder = {
    ...folder,
    id: newId,
    parentFolderId: folder.parentFolderId ?? null,
    requestIds: folder.requestIds ?? [],
    subFolderIds: folder.subFolderIds ?? [],
  };

  // 3. ストアに追加
  set((state) => ({
    savedFolders: [...state.savedFolders, newFolder],
  }));

  // 4. 親フォルダーのsubFolderIdsを更新
  if (newFolder.parentFolderId) {
    updateFolder(newFolder.parentFolderId, {
      subFolderIds: [
        ...(state.savedFolders.find((f) => f.id === newFolder.parentFolderId)?.subFolderIds ?? []),
        newId,
      ],
    });
  }
};
```

### 4.2 読み取り（Read）

#### フォルダー階層の取得

```typescript
// ルートフォルダーの取得
const rootFolders = savedFolders.filter((f) => f.parentFolderId === null);

// 特定フォルダーの子フォルダー取得
const getChildFolders = (parentId: string) =>
  savedFolders.filter((f) => f.parentFolderId === parentId);

// フォルダー内のリクエスト取得
const getFolderRequests = (folderId: string) => {
  const folder = savedFolders.find((f) => f.id === folderId);
  return folder ? savedRequests.filter((r) => folder.requestIds.includes(r.id)) : [];
};
```

### 4.3 更新（Update）

#### フォルダー情報の更新

```typescript
const updateFolder = (id: string, updates: Partial<SavedFolder>) => {
  set((state) => ({
    savedFolders: state.savedFolders.map((folder) =>
      folder.id === id
        ? {
            ...folder,
            ...updates,
            // 重要なフィールドの既存値を保持
            parentFolderId: updates.parentFolderId ?? folder.parentFolderId,
            requestIds: updates.requestIds ?? folder.requestIds,
            subFolderIds: updates.subFolderIds ?? folder.subFolderIds,
          }
        : folder,
    ),
  }));
};
```

### 4.4 削除（Delete）

#### 再帰的削除

```typescript
const deleteFolderRecursive = (folderId: string) => {
  const folder = get().savedFolders.find((f) => f.id === folderId);
  if (!folder) return;

  // 1. 子フォルダーを再帰的に削除
  folder.subFolderIds.forEach((subFolderId) => {
    deleteFolderRecursive(subFolderId);
  });

  // 2. フォルダー内のリクエストを削除
  folder.requestIds.forEach((requestId) => {
    deleteRequest(requestId);
  });

  // 3. 親フォルダーのsubFolderIdsから自分を削除
  if (folder.parentFolderId) {
    const parent = get().savedFolders.find((f) => f.id === folder.parentFolderId);
    if (parent) {
      updateFolder(folder.parentFolderId, {
        subFolderIds: parent.subFolderIds.filter((id) => id !== folderId),
      });
    }
  }

  // 4. フォルダー自体を削除
  set((state) => ({
    savedFolders: state.savedFolders.filter((f) => f.id !== folderId),
  }));
};
```

---

## 5. ドラッグ&ドロップ機能

### 5.1 実装ライブラリ

**React-Arborist**: ツリー構造とドラッグ&ドロップを統合的に提供

### 5.2 ドロップ制限ロジック

```typescript
const disableDrop = ({ dragNodes, parent }) => {
  return dragNodes.some((dragNode) => {
    // 1. リクエストノードへのドロップを禁止
    if (parent && parent.data?.type === 'request') {
      return true;
    }

    // 2. フォルダーを自分自身の子孫に移動することを禁止
    if (dragNode.data?.type === 'folder' && parent) {
      return isDescendant(dragNode.id, parent.id, savedFolders);
    }

    return false;
  });
};
```

### 5.3 移動処理

#### フォルダー移動

```typescript
const moveFolder = (id: string, targetFolderId: string | null, index: number) => {
  const folder = savedFolders.find((f) => f.id === id);
  if (!folder) return;

  // 1. 循環参照チェック
  if (targetFolderId && isDescendant(id, targetFolderId, savedFolders)) {
    return; // 移動を中止
  }

  // 2. 移動元から削除
  if (folder.parentFolderId) {
    const oldParent = savedFolders.find((f) => f.id === folder.parentFolderId);
    if (oldParent) {
      updateFolder(folder.parentFolderId, {
        subFolderIds: oldParent.subFolderIds.filter((fId) => fId !== id),
      });
    }
  }

  // 3. 移動先に挿入
  if (targetFolderId) {
    const newParent = savedFolders.find((f) => f.id === targetFolderId);
    if (newParent) {
      const newSubFolderIds = [...newParent.subFolderIds];
      newSubFolderIds.splice(index, 0, id);
      updateFolder(targetFolderId, { subFolderIds: newSubFolderIds });
    }
  }

  // 4. フォルダーの親ID更新
  updateFolder(id, { parentFolderId: targetFolderId });
};
```

#### リクエスト移動

```typescript
const moveRequest = (id: string, targetFolderId: string | null, index: number) => {
  // 1. 移動元フォルダーから削除
  const currentParent = savedFolders.find((f) => f.requestIds.includes(id));
  if (currentParent) {
    updateFolder(currentParent.id, {
      requestIds: currentParent.requestIds.filter((rId) => rId !== id),
    });
  }

  // 2. 移動先フォルダーに挿入
  if (targetFolderId) {
    const targetFolder = savedFolders.find((f) => f.id === targetFolderId);
    if (targetFolder) {
      const newRequestIds = [...targetFolder.requestIds];
      newRequestIds.splice(index, 0, id);
      updateFolder(targetFolderId, { requestIds: newRequestIds });
    }
  }
};
```

---

## 6. UI/UX設計

### 6.1 コンテキストメニュー

#### 表示条件

- フォルダー右クリック: 全メニュー項目表示
- リクエスト右クリック: リクエスト固有メニュー表示
- 空白右クリック: 新規作成メニューのみ表示

#### メニュー項目

```typescript
const contextMenuItems = [
  {
    label: t('copy'),
    onClick: () => copyFolder(nodeId),
    icon: <CopyIcon />
  },
  {
    label: t('delete'),
    onClick: () => deleteFolderRecursive(nodeId),
    icon: <DeleteIcon />,
    destructive: true
  },
  {
    label: t('rename'),
    onClick: () => node.edit(),
    icon: <EditIcon />
  },
  { separator: true },
  {
    label: t('new_request'),
    onClick: () => onAddRequest(nodeId),
    icon: <RequestIcon />
  },
  {
    label: t('new_folder'),
    onClick: () => onAddFolder(nodeId),
    icon: <FolderIcon />
  }
];
```

### 6.2 インライン編集

#### 編集開始

- `node.edit()`でテキスト入力モードに切り替え
- 元の名前をデフォルト値として設定

#### 編集確定・キャンセル

```typescript
const handleSubmit = (node, newName) => {
  if (newName.trim() && newName !== node.data.name) {
    if (node.data.type === 'folder') {
      updateFolder(node.id, { name: newName.trim() });
    } else {
      updateRequest(node.id, { name: newName.trim() });
    }
  }
  node.submit();
};

const handleCancel = (node) => {
  node.reset();
};
```

### 6.3 ビジュアルフィードバック

#### 展開/折りたたみ状態

- **展開中**: フォルダーアイコンが開いた状態
- **折りたたみ中**: フォルダーアイコンが閉じた状態
- **子要素なし**: アイコンなし（リーフフォルダー）

#### ドラッグ状態

- **ドラッグ中**: ノードの透明度を下げる
- **ドロップ可能**: ターゲットをハイライト
- **ドロップ不可**: 赤色のプロヒビションアイコン

#### 選択状態

- **アクティブリクエスト**: 青色のボーダー
- **ホバー**: 背景色の変更
- **フォーカス**: キーボードフォーカスの視覚化

---

## 7. パフォーマンス最適化

### 7.1 レンダリング最適化

#### React.memo使用

```typescript
const TreeNode = React.memo(({ node, ...props }) => {
  // ノードの内容が変更された場合のみ再レンダリング
});
```

#### 仮想化（将来的改善案）

- 大量のフォルダー・リクエストがある場合の仮想スクロール
- React-Arboristの仮想化機能活用

### 7.2 データ構造最適化

#### インデックス化（将来的改善案）

```typescript
// 親子関係の高速検索のためのマップ
const parentChildMap = new Map<string, string[]>();
const childParentMap = new Map<string, string>();

// O(1)での親子関係検索
const getChildren = (parentId: string) => parentChildMap.get(parentId) ?? [];
const getParent = (childId: string) => childParentMap.get(childId);
```

### 7.3 メモリ使用量最適化

#### 循環参照の防止

- 明示的な親子関係管理
- WeakMapの活用（参照カウンタ対策）

---

## 8. テスト戦略

### 8.1 ユニットテスト

#### buildTree関数

```typescript
describe('buildTree', () => {
  test('正しい階層構造を構築する', () => {
    const folders = [
      { id: 'f1', name: 'Folder1', parentFolderId: null, requestIds: ['r1'], subFolderIds: ['f2'] },
      { id: 'f2', name: 'Folder2', parentFolderId: 'f1', requestIds: ['r2'], subFolderIds: [] },
    ];
    const requests = [
      { id: 'r1', name: 'Request1' },
      { id: 'r2', name: 'Request2' },
    ];

    const tree = buildTree(folders, requests);

    expect(tree).toHaveLength(1);
    expect(tree[0].children).toHaveLength(2); // Folder2 + Request2
  });
});
```

#### isDescendant関数

```typescript
describe('isDescendant', () => {
  test('循環参照を正しく検出する', () => {
    const folders = [
      { id: 'f1', parentFolderId: 'f2' },
      { id: 'f2', parentFolderId: 'f3' },
      { id: 'f3', parentFolderId: null },
    ];

    expect(isDescendant('f1', 'f3', folders)).toBe(true);
    expect(isDescendant('f3', 'f1', folders)).toBe(false);
  });
});
```

### 8.2 インテグレーションテスト

#### ドラッグ&ドロップ

```typescript
describe('フォルダー移動', () => {
  test('有効な移動を正しく処理する', () => {
    // フォルダー移動のシミュレーション
    // 移動前後の状態検証
  });

  test('無効な移動を拒否する', () => {
    // 循環参照になる移動の試行
    // エラーハンドリングの検証
  });
});
```

### 8.3 E2Eテスト

#### ユーザーワークフロー

```typescript
test('フォルダー作成から削除までの完全なワークフロー', async ({ page }) => {
  // 1. フォルダー作成
  await page.rightClick('[data-testid="folder-tree"]');
  await page.click('text="新しいフォルダー"');

  // 2. フォルダー名変更
  await page.dblclick('[data-testid="folder-new"]');
  await page.fill('input', 'テストフォルダー');
  await page.press('input', 'Enter');

  // 3. リクエスト追加
  await page.rightClick('[data-testid="folder-test"]');
  await page.click('text="新しいリクエスト"');

  // 4. フォルダー削除
  await page.rightClick('[data-testid="folder-test"]');
  await page.click('text="削除"');
  await page.click('text="確認"');

  // 5. 削除確認
  await expect(page.locator('[data-testid="folder-test"]')).toHaveCount(0);
});
```

---

## 9. エラーハンドリング

### 9.1 予期されるエラー

#### データ整合性エラー

- **孤立フォルダー**: 親フォルダーが存在しないフォルダーの検出・修復
- **孤立リクエスト**: フォルダーが削除されたリクエストの検出・修復
- **循環参照**: 親子関係の循環を検出・修復

#### 操作エラー

- **重複名**: 同一階層での重複フォルダー名の処理
- **不正な移動**: 循環参照になる移動の拒否
- **存在しないターゲット**: 削除済みフォルダーへの移動の処理

### 9.2 エラー回復戦略

#### データ修復

```typescript
const repairDataIntegrity = () => {
  // 1. 孤立フォルダーをルートに移動
  const orphanedFolders = savedFolders.filter(
    (folder) => folder.parentFolderId && !savedFolders.find((f) => f.id === folder.parentFolderId),
  );

  orphanedFolders.forEach((folder) => {
    updateFolder(folder.id, { parentFolderId: null });
  });

  // 2. 存在しないリクエストIDを削除
  savedFolders.forEach((folder) => {
    const validRequestIds = folder.requestIds.filter((requestId) =>
      savedRequests.find((r) => r.id === requestId),
    );

    if (validRequestIds.length !== folder.requestIds.length) {
      updateFolder(folder.id, { requestIds: validRequestIds });
    }
  });
};
```

#### グレースフルデグラデーション

```typescript
const safeDeleteFolder = (folderId: string) => {
  try {
    deleteFolderRecursive(folderId);
  } catch (error) {
    console.error('フォルダー削除エラー:', error);

    // フォールバック: フォルダーのみ削除、リクエストは保持
    set((state) => ({
      savedFolders: state.savedFolders.filter((f) => f.id !== folderId),
    }));

    // ユーザーへの通知
    showErrorToast('フォルダーの削除中にエラーが発生しました。リクエストは保持されます。');
  }
};
```

---

## 10. 拡張性設計

### 10.1 プラグイン機能（将来構想）

#### フォルダープロパティ拡張

```typescript
interface ExtendedFolder extends SavedFolder {
  metadata?: {
    color?: string; // フォルダーカラー
    icon?: string; // カスタムアイコン
    description?: string; // 説明文
    tags?: string[]; // タグ
  };
}
```

#### カスタムソート

```typescript
type SortStrategy = 'alphabetical' | 'created' | 'modified' | 'custom';

interface SortConfig {
  strategy: SortStrategy;
  direction: 'asc' | 'desc';
  customOrder?: string[]; // カスタムソート順
}
```

### 10.2 エクスポート/インポート機能

#### フォルダー構造のエクスポート

```typescript
interface ExportFormat {
  version: string;
  timestamp: string;
  folders: SavedFolder[];
  requests: SavedRequest[];
  metadata: {
    totalFolders: number;
    totalRequests: number;
    maxDepth: number;
  };
}

const exportFolderStructure = (): ExportFormat => {
  return {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    folders: savedFolders,
    requests: savedRequests,
    metadata: {
      totalFolders: savedFolders.length,
      totalRequests: savedRequests.length,
      maxDepth: calculateMaxDepth(savedFolders),
    },
  };
};
```

### 10.3 他ツール連携

#### Postman Collection変換

```typescript
const convertToPostmanCollection = (folderId?: string) => {
  // Postman Collection v2.1形式への変換
  const postmanCollection = {
    info: {
      name: 'ReqX-Atelier Export',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: buildPostmanItems(folderId),
  };

  return postmanCollection;
};
```

---

この詳細設計書により、フォルダ機能の実装詳細、設計思想、拡張計画を体系的に理解できます。開発者の参考資料、コードレビューの指針、機能拡張時の設計書として活用できます。
