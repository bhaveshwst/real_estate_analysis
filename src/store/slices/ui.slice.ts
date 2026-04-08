import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
  onboardingComplete: boolean;
  pushNotificationsEnabled: boolean;
  preferredCurrency: 'USD';
  preferredUnits: 'imperial' | 'metric';
}

const initialState: UIState = {
  onboardingComplete: false,
  pushNotificationsEnabled: false,
  preferredCurrency: 'USD',
  preferredUnits: 'imperial',
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    completeOnboarding(state) {
      state.onboardingComplete = true;
    },
    setPushNotifications(state, action: PayloadAction<boolean>) {
      state.pushNotificationsEnabled = action.payload;
    },
    setPreferredUnits(state, action: PayloadAction<'imperial' | 'metric'>) {
      state.preferredUnits = action.payload;
    },
  },
});

export const { completeOnboarding, setPushNotifications, setPreferredUnits } =
  uiSlice.actions;
