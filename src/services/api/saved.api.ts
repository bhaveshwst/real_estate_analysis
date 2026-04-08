import { apiClient } from './client';
import type {
  ApiResponse,
  PaginationMeta,
  SavedProperty,
  SavePropertyRequest,
} from '@/types';

export const savedPropertiesApi = {
  save: async (payload: SavePropertyRequest): Promise<SavedProperty> => {
    const { data } = await apiClient.post<ApiResponse<SavedProperty>>(
      '/saved-properties',
      payload,
    );
    return data.data;
  },

  getAll: async (
    page = 1,
    limit = 20,
    listName?: string,
  ): Promise<{ items: SavedProperty[]; meta: PaginationMeta }> => {
    const { data } = await apiClient.get<
      ApiResponse<SavedProperty[]> & { meta: PaginationMeta }
    >('/saved-properties', { params: { page, limit, listName } });
    return { items: data.data, meta: data.meta! };
  },

  getListNames: async (): Promise<string[]> => {
    const { data } = await apiClient.get<ApiResponse<string[]>>(
      '/saved-properties/lists',
    );
    return data.data;
  },

  isSaved: async (propertyId: string): Promise<boolean> => {
    const { data } = await apiClient.get<ApiResponse<{ isSaved: boolean }>>(
      `/saved-properties/check/${propertyId}`,
    );
    return data.data.isSaved;
  },

  update: async (
    id: string,
    payload: Partial<SavePropertyRequest>,
  ): Promise<SavedProperty> => {
    const { data } = await apiClient.patch<ApiResponse<SavedProperty>>(
      `/saved-properties/${id}`,
      payload,
    );
    return data.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/saved-properties/${id}`);
  },
};
