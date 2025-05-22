import { useSavedRequestsStore } from '../store/savedRequestsStore';

export const useSavedRequests = () => {
  const savedRequests = useSavedRequestsStore((s) => s.savedRequests);
  const savedFolders = useSavedRequestsStore((s) => s.savedFolders);
  const addRequest = useSavedRequestsStore((s) => s.addRequest);
  const updateRequest = useSavedRequestsStore((s) => s.updateRequest);
  const deleteRequest = useSavedRequestsStore((s) => s.deleteRequest);
  const copyRequest = useSavedRequestsStore((s) => s.copyRequest);
  const addFolder = useSavedRequestsStore((s) => s.addFolder);
  const updateFolder = useSavedRequestsStore((s) => s.updateFolder);
  const deleteFolderRecursive = useSavedRequestsStore((s) => s.deleteFolderRecursive);
  const moveRequest = useSavedRequestsStore((s) => s.moveRequest);
  const moveFolder = useSavedRequestsStore((s) => s.moveFolder);
  const setRequests = useSavedRequestsStore((s) => s.setRequests);
  const setFolders = useSavedRequestsStore((s) => s.setFolders);

  return {
    savedRequests,
    savedFolders,
    addRequest,
    updateRequest,
    deleteRequest,
    copyRequest,
    addFolder,
    updateFolder,
    deleteFolderRecursive,
    moveRequest,
    moveFolder,
    setRequests,
    setFolders,
  };
};
