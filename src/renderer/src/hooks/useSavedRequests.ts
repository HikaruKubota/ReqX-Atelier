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
  const deleteFolder = useSavedRequestsStore((s) => s.deleteFolder);
  const moveRequestToFolder = useSavedRequestsStore((s) => s.moveRequestToFolder);
  const moveFolder = useSavedRequestsStore((s) => s.moveFolder);

  return {
    savedRequests,
    savedFolders,
    addRequest,
    updateRequest,
    deleteRequest,
    copyRequest,
    addFolder,
    updateFolder,
    deleteFolder,
    moveRequestToFolder,
    moveFolder,
  };
};
