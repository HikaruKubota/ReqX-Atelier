import { useSavedRequestsStore } from '../store/savedRequestsStore';

export const useSavedFolders = () => {
  const savedFolders = useSavedRequestsStore((s) => s.savedFolders);
  const addFolder = useSavedRequestsStore((s) => s.addFolder);
  const updateFolder = useSavedRequestsStore((s) => s.updateFolder);
  const deleteFolder = useSavedRequestsStore((s) => s.deleteFolder);

  return { savedFolders, addFolder, updateFolder, deleteFolder };
};
