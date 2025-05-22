import { useSavedRequestsStore } from '../store/savedRequestsStore';

export const useSavedFolders = () => {
  const savedFolders = useSavedRequestsStore((s) => s.savedFolders);
  const addFolder = useSavedRequestsStore((s) => s.addFolder);
  const updateFolder = useSavedRequestsStore((s) => s.updateFolder);
  const deleteFolder = useSavedRequestsStore((s) => s.deleteFolder);
  const moveRequestToFolder = useSavedRequestsStore((s) => s.moveRequestToFolder);
  const moveFolderToFolder = useSavedRequestsStore((s) => s.moveFolderToFolder);

  return {
    savedFolders,
    addFolder,
    updateFolder,
    deleteFolder,
    moveRequestToFolder,
    moveFolderToFolder,
  };
};
