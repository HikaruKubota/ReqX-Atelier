import { useSavedRequestsStore } from '../store/savedRequestsStore';

export const useSavedRequests = () => {
  const savedRequests = useSavedRequestsStore((s) => s.savedRequests);
  const savedFolders = useSavedRequestsStore((s) => s.savedFolders);
  const addRequest = useSavedRequestsStore((s) => s.addRequest);
  const updateRequest = useSavedRequestsStore((s) => s.updateRequest);
  const deleteRequest = useSavedRequestsStore((s) => s.deleteRequest);
  const copyRequest = useSavedRequestsStore((s) => s.copyRequest);
  const reorderRequests = useSavedRequestsStore((s) => s.reorderRequests);
  const addFolder = useSavedRequestsStore((s) => s.addFolder);
  const moveRequestToFolder = useSavedRequestsStore((s) => s.moveRequestToFolder);

  return {
    savedRequests,
    savedFolders,
    addRequest,
    updateRequest,
    deleteRequest,
    copyRequest,
    reorderRequests,
    addFolder,
    moveRequestToFolder,
  };
};
