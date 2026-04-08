import { apiClient } from './client';
import type {
  ApiResponse,
  MarketSnapshot,
  PropertyValuation,
} from '@/types';

export type AnalyticsPeriod = '1m' | '3m' | '6m' | '1y' | '3y' | '5y';

export const analyticsApi = {
  getMarketSnapshot: async (
    zipCode: string,
    period: AnalyticsPeriod = '1y',
  ): Promise<MarketSnapshot> => {
    const { data } = await apiClient.get<ApiResponse<MarketSnapshot>>(
      '/analytics/market',
      { params: { zipCode, period } },
    );
    return data.data;
  },

  getValuation: async (propertyId: string): Promise<PropertyValuation> => {
    const { data } = await apiClient.get<ApiResponse<PropertyValuation>>(
      `/analytics/valuation/${propertyId}`,
    );
    return data.data;
  },

  getZipSummary: async (zipCode: string) => {
    const { data } = await apiClient.get<ApiResponse<Record<string, unknown>>>(
      `/analytics/zip-summary/${zipCode}`,
    );
    return data.data;
  },
};
