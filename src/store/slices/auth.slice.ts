import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '@/services/api';
import { tokenStorage } from '@/services/storage/token-storage';
import { extractErrorMessage } from '@/shared/utils/error';
import type { UserProfile, LoginRequest, RegisterRequest, AuthTokens } from '@/types';
import type { RootState } from '@/store';

// ═══════════════════════════════════════════
//  State shape
// ═══════════════════════════════════════════

/**
 * Auth state machine:
 *
 *   [idle] ──hydrate──→ [hydrated, unauthenticated]
 *                      or [hydrated, authenticated]
 *
 *   [hydrated, unauthenticated] ──login/register──→ [authenticated]
 *   [authenticated] ──logout/forceLogout──→ [unauthenticated]
 *
 * `isHydrated` is false only during the initial app load.
 * Once set to true, it never goes back to false.
 */
export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isHydrated: false,
  error: null,
};

// ═══════════════════════════════════════════
//  Token persistence helper
// ═══════════════════════════════════════════

function persistAuthResult(result: AuthTokens): void {
  tokenStorage.setTokens(result.accessToken, result.refreshToken);
  tokenStorage.setUserProfile(result.user as unknown as Record<string, unknown>);
}

// ═══════════════════════════════════════════
//  Async thunks
// ═══════════════════════════════════════════

export const hydrateAuth = createAsyncThunk<UserProfile | null>(
  'auth/hydrate',
  async () => {
    await tokenStorage.hydrate();
    const token = tokenStorage.getAccessToken();
    const user = tokenStorage.getUserProfile<UserProfile>();
    if (token && user) return user;
    return null;
  },
);

export const login = createAsyncThunk<AuthTokens, LoginRequest, { rejectValue: string }>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('LOGIN DATA:', credentials);
      const result = await authApi.login(credentials);
      persistAuthResult(result);
      console.log('LOGIN SUCCESS RESPONSE:', result);
      return result;
    } catch (error: unknown) {
      console.log('LOGIN ERROR:', error);

      return rejectWithValue(extractErrorMessage(error, 'Login failed'));
    }
  },
);

export const register = createAsyncThunk<AuthTokens, RegisterRequest, { rejectValue: string }>(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      console.log('LOGIN DATA:', payload);
      const result = await authApi.register(payload);
      persistAuthResult(result);
      return result;
    } catch (error: unknown) {
      return rejectWithValue(extractErrorMessage(error, 'Registration failed'));
    }
  },
);

export const logout = createAsyncThunk<void, void>(
  'auth/logout',
  async () => {
    try {
      await authApi.logout();
    } catch {
      // Proceed with local logout even if server call fails
    } finally {
      tokenStorage.clearTokens();
    }
  },
);

// ═══════════════════════════════════════════
//  Slice
// ═══════════════════════════════════════════

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    /**
     * Called by the Axios response interceptor when refresh fails.
     * Immediately resets auth state — RootNavigator reacts by
     * swapping to the Auth stack.
     */
    forceLogout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      tokenStorage.clearTokens();
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Hydrate ──
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        state.isHydrated = true;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        }
      })
      .addCase(hydrateAuth.rejected, (state) => {
        state.isHydrated = true;
      })
      // ── Login ──
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Login failed';
      })
      // ── Register ──
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Registration failed';
      })
      // ── Logout ──
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, forceLogout } = authSlice.actions;

// ═══════════════════════════════════════════
//  Selectors
// ═══════════════════════════════════════════

export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectIsAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
