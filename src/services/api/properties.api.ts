import { apiClient } from './client';
import type {
  ApiResponse,
  PaginationMeta,
  PropertySummary,
  PropertyDetail,
  PropertySearchParams,
  AutocompleteResult,
} from '@/types';

type RawAutocomplete = {
  placeId?: string;
  place_id?: string;
  id?: string;
  description?: string;
  mainText?: string;
  secondaryText?: string;
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
  };
};

type AutocompletePayload =
  | RawAutocomplete[]
  | { predictions?: RawAutocomplete[]; items?: RawAutocomplete[]; results?: RawAutocomplete[] }
  | null
  | undefined;

function extractAutocompleteItems(payload: AutocompletePayload): RawAutocomplete[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.predictions)) return payload.predictions;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.results)) return payload.results;
  return [];
}

function normalizeAutocompleteResults(items: RawAutocomplete[]): AutocompleteResult[] {
  return items
    .map((item) => {
      const mainText = item.mainText ?? item.structured_formatting?.main_text ?? '';
      const secondaryText = item.secondaryText ?? item.structured_formatting?.secondary_text ?? '';
      const description = item.description ?? [mainText, secondaryText].filter(Boolean).join(', ');
      const placeId = item.placeId ?? item.place_id ?? item.id ?? description;

      return {
        placeId,
        description,
        mainText: mainText || description,
        secondaryText,
      };
    })
    .filter((item) => item.placeId.length > 0 && item.description.length > 0);
}

export const propertiesApi = {
  search: async (
    params: PropertySearchParams,
  ): Promise<{ items: PropertySummary[]; meta: PaginationMeta }> => {
    const { data } = await apiClient.get<
      ApiResponse<PropertySummary[]> & { meta: PaginationMeta }
    >('/properties/search', { params });
    return { items: data.data, meta: data.meta! };
  },

  getDetail: async (id: string): Promise<PropertyDetail> => {
    const { data } = await apiClient.get<ApiResponse<PropertyDetail>>(
      `/properties/${id}`,
    );
    return data.data;
  },

  getByAttomId: async (attomId: string): Promise<PropertyDetail> => {
    const { data } = await apiClient.get<ApiResponse<PropertyDetail>>(
      `/properties/attom/${attomId}`,
    );
    return data.data;
  },

  autocomplete: async (input: string): Promise<AutocompleteResult[]> => {
    const { data } = await apiClient.get<ApiResponse<AutocompletePayload>>(
      '/properties/autocomplete',
      { params: { input, query: input } },
    );
    return normalizeAutocompleteResults(extractAutocompleteItems(data.data));
  },
};
