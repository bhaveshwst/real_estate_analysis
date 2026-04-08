import { useQuery } from '@tanstack/react-query';
import { propertiesApi, analyticsApi, savedPropertiesApi } from '@/services/api';
import { CACHE_TTL } from '@/shared/constants';

export const propertyKeys = {
  all: ['properties'] as const,
  detail: (id: string) => ['properties', 'detail', id] as const,
  valuation: (id: string) => ['properties', 'valuation', id] as const,
  isSaved: (id: string) => ['properties', 'isSaved', id] as const,
};

export function usePropertyDetail(propertyId: string) {
  return useQuery({
    queryKey: propertyKeys.detail(propertyId),
    queryFn: () => propertiesApi.getDetail(propertyId),
    enabled: !!propertyId,
    staleTime: CACHE_TTL.PROPERTY_DETAIL,
  });
}

export function usePropertyValuation(propertyId: string) {
  return useQuery({
    queryKey: propertyKeys.valuation(propertyId),
    queryFn: () => analyticsApi.getValuation(propertyId),
    enabled: !!propertyId,
    staleTime: CACHE_TTL.PROPERTY_VALUATION,
  });
}

export function useIsSaved(propertyId: string) {
  return useQuery({
    queryKey: propertyKeys.isSaved(propertyId),
    queryFn: () => savedPropertiesApi.isSaved(propertyId),
    enabled: !!propertyId,
    staleTime: CACHE_TTL.IS_SAVED,
  });
}
