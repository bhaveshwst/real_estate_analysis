import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config';
import { tokenStorage } from '@/services/storage/token-storage';
import type { ApiError } from '@/types';

/**
 * Base Axios client.
 * Auth token injection and refresh token rotation are handled
 * via interceptors — individual API modules never touch tokens.
 */
export const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Track in-flight refresh to avoid concurrent refresh races ──
let isRefreshing = false;
let refreshSubscribers: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function onRefreshed(newToken: string) {
  refreshSubscribers.forEach(({ resolve }) => resolve(newToken));
  refreshSubscribers = [];
}

function onRefreshFailed(error: unknown) {
  refreshSubscribers.forEach(({ reject }) => reject(error));
  refreshSubscribers = [];
}

function addRefreshSubscriber(
  resolve: (token: string) => void,
  reject: (error: unknown) => void,
) {
  refreshSubscribers.push({ resolve, reject });
}

// ── Request interceptor: attach access token ──
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: handle 401 + refresh rotation ──
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If not 401, or already retried, or it's the refresh endpoint itself — reject
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(normalizeError(error));
    }

    // Attempt token refresh
    if (!isRefreshing) {
      isRefreshing = true;
      originalRequest._retry = true;

      try {
        const refreshToken = tokenStorage.getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(
          `${env.API_BASE_URL}/auth/refresh`,
          { refreshToken },
        );

        const newAccessToken = data.data.accessToken;
        tokenStorage.setTokens(newAccessToken, data.data.refreshToken);

        isRefreshing = false;
        onRefreshed(newAccessToken);

        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        onRefreshFailed(refreshError);
        tokenStorage.clearTokens();
        // The auth store listener will navigate to login
        return Promise.reject(refreshError);
      }
    }

    // Another request hit 401 while refresh is in-flight — queue it
    return new Promise((resolve, reject) => {
      addRefreshSubscriber((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        resolve(apiClient(originalRequest));
      }, reject);
    });
  },
);

// ── Normalize axios errors into a predictable shape ──
export interface AppError {
  code: string;
  message: string;
  status: number;
  details?: Record<string, unknown> | null;
}

function normalizeError(error: AxiosError<ApiError>): AppError {
  if (error.response?.data?.error) {
    const { code, message, details } = error.response.data.error;
    return { code, message, status: error.response.status, details };
  }

  if (error.code === 'ECONNABORTED') {
    return { code: 'TIMEOUT', message: 'Request timed out', status: 0 };
  }

  if (!error.response) {
    return { code: 'NETWORK_ERROR', message: 'Network connection failed', status: 0 };
  }

  return {
    code: `HTTP_${error.response.status}`,
    message: error.message,
    status: error.response.status,
  };
}
