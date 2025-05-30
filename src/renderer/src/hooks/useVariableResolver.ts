import { useCallback } from 'react';
import { useVariablesStore } from '../store/variablesStore';
import { useSavedRequests } from './useSavedRequests';
import type { VariableResolutionContext } from '../types';

export const useVariableResolver = () => {
  const { resolveVariables, getUndefinedVariables } = useVariablesStore();
  const { savedFolders } = useSavedRequests();

  // Helper function to get all parent folder IDs in hierarchy order (child to root)
  const getFolderHierarchy = useCallback(
    (folderId: string): string[] => {
      const hierarchy: string[] = [];
      let currentFolderId: string | null = folderId;

      while (currentFolderId) {
        hierarchy.push(currentFolderId);
        const folder = savedFolders.find((f) => f.id === currentFolderId);
        currentFolderId = folder?.parentFolderId || null;
      }

      return hierarchy;
    },
    [savedFolders],
  );

  const createResolutionContext = useCallback(
    (requestId?: string | null): VariableResolutionContext => {
      let folderId: string | undefined;
      
      if (requestId) {
        // Find the folder that contains this request
        const folder = savedFolders.find((f) => f.requestIds.includes(requestId));
        folderId = folder?.id;
      }

      return {
        requestId: requestId || undefined,
        folderId,
        collectionId: undefined, // We don't have collections yet, but the structure is ready
      };
    },
    [savedFolders],
  );

  const resolveAllVariables = useCallback(
    (
      url: string,
      headers: Record<string, string>,
      body: string,
      requestId?: string | null,
    ): {
      url: string;
      headers: Record<string, string>;
      body: string;
      undefinedVariables: string[];
    } => {
      const context = createResolutionContext(requestId);

      // Create an enhanced context that includes all folder hierarchy
      const enhancedContext = {
        ...context,
        folderHierarchy: context.folderId ? getFolderHierarchy(context.folderId) : [],
      };

      // Resolve variables in URL
      const resolvedUrl = resolveVariables(url, enhancedContext);

      // Resolve variables in headers
      const resolvedHeaders: Record<string, string> = {};
      Object.entries(headers).forEach(([key, value]) => {
        const resolvedKey = resolveVariables(key, enhancedContext);
        const resolvedValue = resolveVariables(value, enhancedContext);
        resolvedHeaders[resolvedKey] = resolvedValue;
      });

      // Resolve variables in body
      const resolvedBody = resolveVariables(body, enhancedContext);

      // Collect all undefined variables
      const undefinedInUrl = getUndefinedVariables(url, enhancedContext);
      const undefinedInHeaders = Object.entries(headers).flatMap(([key, value]) => [
        ...getUndefinedVariables(key, enhancedContext),
        ...getUndefinedVariables(value, enhancedContext),
      ]);
      const undefinedInBody = getUndefinedVariables(body, enhancedContext);

      const allUndefined = [
        ...new Set([...undefinedInUrl, ...undefinedInHeaders, ...undefinedInBody]),
      ];

      return {
        url: resolvedUrl,
        headers: resolvedHeaders,
        body: resolvedBody,
        undefinedVariables: allUndefined,
      };
    },
    [resolveVariables, getUndefinedVariables, createResolutionContext, getFolderHierarchy],
  );

  return {
    resolveAllVariables,
    createResolutionContext,
  };
};