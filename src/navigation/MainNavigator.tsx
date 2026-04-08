import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { palette, spacing } from '@/theme';
import type {
  MainTabParamList,
  DashboardStackParamList,
  SearchStackParamList,
  SavedStackParamList,
} from '@/types';

// ── Screens ──
import { DashboardScreen } from '@/features/dashboard/screens/DashboardScreen';
import { SearchScreen } from '@/features/search/screens/SearchScreen';
import { SearchResultsScreen } from '@/features/search/screens/SearchResultsScreen';
import { PropertyDetailScreen } from '@/features/property/screens/PropertyDetailScreen';
import { SavedListScreen } from '@/features/saved/screens/SavedListScreen';
import { ProfileScreen } from '@/features/auth/screens/ProfileScreen';
import { MarketAnalyticsScreen } from '@/features/analytics/screens/MarketAnalyticsScreen';

// ─────────────────────────────────────────────
//  Per-tab stack navigators
// ─────────────────────────────────────────────

const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
function DashboardNavigator() {
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
      <DashboardStack.Screen name="Dashboard" component={DashboardScreen} />
      <DashboardStack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
      <DashboardStack.Screen name="MarketAnalytics" component={MarketAnalyticsScreen} />
    </DashboardStack.Navigator>
  );
}

const SearchStack = createNativeStackNavigator<SearchStackParamList>();
function SearchNavigator() {
  return (
    <SearchStack.Navigator screenOptions={{ headerShown: false }}>
      <SearchStack.Screen name="Search" component={SearchScreen} />
      <SearchStack.Screen name="SearchResults" component={SearchResultsScreen} />
      <SearchStack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
    </SearchStack.Navigator>
  );
}

const SavedStack = createNativeStackNavigator<SavedStackParamList>();
function SavedNavigator() {
  return (
    <SavedStack.Navigator screenOptions={{ headerShown: false }}>
      <SavedStack.Screen name="SavedList" component={SavedListScreen} />
      <SavedStack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
    </SavedStack.Navigator>
  );
}

// ─────────────────────────────────────────────
//  Bottom tab navigator
// ─────────────────────────────────────────────

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.teal,
        tabBarInactiveTintColor: palette.gray400,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginBottom: 4,
        },
        tabBarStyle: {
          backgroundColor: palette.white,
          borderTopWidth: 0.5,
          borderTopColor: palette.gray200,
          height: 84,
          paddingTop: spacing.sm,
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardNavigator}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchNavigator}
        options={{ tabBarLabel: 'Search' }}
      />
      <Tab.Screen
        name="SavedTab"
        component={SavedNavigator}
        options={{ tabBarLabel: 'Saved' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
