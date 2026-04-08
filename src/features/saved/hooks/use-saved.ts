import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { savedPropertiesApi } from '@/services/api';
import { propertyKeys } from '@/features/property/hooks/use-property';
import type { SavePropertyRequest, SavedProperty } from '@/types';

export const savedKeys = {
  all: ['saved'] as const,
  list: (page: number, listName?: string) =>
    ['saved', 'list', { page, listName }] as const,
  lists: ['saved', 'lists'] as const,
};

export function useSavedProperties(page = 1, listName?: string) {
  return useQuery({
    queryKey: savedKeys.list(page, listName),
    queryFn: () => savedPropertiesApi.getAll(page, 20, listName),
  });
}

export function useSavedListNames() {
  return useQuery({
    queryKey: savedKeys.lists,
    queryFn: () => savedPropertiesApi.getListNames(),
  });
}

export function useSaveProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SavePropertyRequest) =>
      savedPropertiesApi.save(payload),
    onSuccess: (_data, variables) => {
      // Invalidate the saved list and the isSaved check for this property
      queryClient.invalidateQueries({ queryKey: savedKeys.all });
      queryClient.setQueryData(
        propertyKeys.isSaved(variables.propertyId),
        true,
      );
    },
  });
}

export function useUnsaveProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (savedId: string) => savedPropertiesApi.remove(savedId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savedKeys.all });
    },
  });
}

export function useUpdateSavedProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<SavePropertyRequest>;
    }) => savedPropertiesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savedKeys.all });
    },
  });
}
