import { useSavedRequestsStore } from '../store/savedRequestsStore';

export const useSavedRequests = () => {
  const savedRequests = useSavedRequestsStore((s) => s.savedRequests);
  const addRequest = useSavedRequestsStore((s) => s.addRequest);
  const updateRequest = useSavedRequestsStore((s) => s.updateRequest);
  const deleteRequest = useSavedRequestsStore((s) => s.deleteRequest);
  const copyRequest = useSavedRequestsStore((s) => s.copyRequest);
  const reorderRequests = useSavedRequestsStore((s) => s.reorderRequests);

  return {
    savedRequests,
    addRequest,
    updateRequest,
    deleteRequest,
    copyRequest,
    reorderRequests,
  };
};
