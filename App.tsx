import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { store } from '@/store';
import { queryClient } from '@/services/api/query-client';
import { RootNavigator } from '@/navigation';
import { palette } from '@/theme';

/**
 * Provider ordering matters:
 *
 * 1. GestureHandlerRootView — must wrap everything for react-native-gesture-handler
 * 2. SafeAreaProvider — provides safe area insets to all children
 * 3. ReduxProvider — auth state must be available before navigation decides which stack to show
 * 4. QueryClientProvider — server state cache, available to all screens
 * 5. RootNavigator — reads Redux auth state to pick Auth vs Main stack
 */
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ReduxProvider store={store}>
          <QueryClientProvider client={queryClient}>
            <StatusBar barStyle="dark-content" backgroundColor={palette.white} />
            <RootNavigator />
          </QueryClientProvider>
        </ReduxProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
