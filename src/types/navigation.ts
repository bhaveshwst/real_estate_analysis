import type { NavigatorScreenParams, CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// ═══════════════════════════════════════════
//  Param lists
// ═══════════════════════════════════════════

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  DashboardTab: NavigatorScreenParams<DashboardStackParamList>;
  SearchTab: NavigatorScreenParams<SearchStackParamList>;
  SavedTab: NavigatorScreenParams<SavedStackParamList>;
  ProfileTab: undefined;
};

export type DashboardStackParamList = {
  Dashboard: undefined;
  PropertyDetail: { propertyId: string };
  MarketAnalytics: { zipCode: string };
};

export type SearchStackParamList = {
  Search: undefined;
  SearchResults: undefined;
  PropertyDetail: { propertyId: string };
};

export type SavedStackParamList = {
  SavedList: undefined;
  PropertyDetail: { propertyId: string };
};

// ═══════════════════════════════════════════
//  Composite screen props — fully typed, no casts needed
// ═══════════════════════════════════════════

// Dashboard screens get access to both their own stack AND the parent tab navigator
export type DashboardScreenProps = CompositeScreenProps<
  NativeStackScreenProps<DashboardStackParamList, 'Dashboard'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'DashboardTab'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type MarketAnalyticsScreenProps = NativeStackScreenProps<DashboardStackParamList, 'MarketAnalytics'>;

// Search screens
export type SearchScreenProps = CompositeScreenProps<
  NativeStackScreenProps<SearchStackParamList, 'Search'>,
  BottomTabScreenProps<MainTabParamList, 'SearchTab'>
>;
export type SearchResultsScreenProps = NativeStackScreenProps<SearchStackParamList, 'SearchResults'>;

// Saved screens
export type SavedListScreenProps = NativeStackScreenProps<SavedStackParamList, 'SavedList'>;

// Auth screens
export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;
export type ForgotPasswordScreenProps = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

// Property detail (shared across stacks — use the params directly)
export type PropertyDetailParams = { propertyId: string };
