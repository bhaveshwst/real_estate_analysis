import { apiClient } from './client';
import type {
  ApiResponse,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
} from '@/types';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthTokens> => {
    const { data } = await apiClient.post<ApiResponse<AuthTokens>>(
      '/auth/login',
      credentials,
    );
    return data.data;
  },

  register: async (payload: RegisterRequest): Promise<AuthTokens> => {
    const { data } = await apiClient.post<ApiResponse<AuthTokens>>(
      '/auth/register',
      payload,
    );
    return data.data;
  },

  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    const { data } = await apiClient.post<ApiResponse<AuthTokens>>(
      '/auth/refresh',
      { refreshToken },
    );
    return data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email });
  },
};
