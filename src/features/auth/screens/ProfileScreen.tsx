import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '@/store';
import { logout, selectUser } from '@/store/slices/auth.slice';
import { ScreenAppBar } from '@/components/ScreenAppBar';
import { palette, spacing, radius, typography, layout } from '@/theme';

export function ProfileScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + spacing.lg }]}>
      <ScreenAppBar />
      <View style={styles.avatar}>
        <Text style={styles.initials}>
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </Text>
      </View>
      <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <Text style={styles.role}>{user?.role?.toUpperCase()} plan</Text>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => dispatch(logout())}
        activeOpacity={0.8}
      >
        <Text style={styles.logoutText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.white, alignItems: 'center', paddingTop: spacing.xl },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: palette.tealLight, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg },
  initials: { ...typography.displaySm, color: palette.teal },
  name: { ...typography.headingLg, color: palette.navy },
  email: { ...typography.bodyMd, color: palette.gray500, marginTop: spacing.xs },
  role: { ...typography.labelSm, color: palette.teal, backgroundColor: palette.tealLight, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.full, marginTop: spacing.md, overflow: 'hidden' },
  logoutButton: { height: layout.buttonHeight, borderWidth: 1, borderColor: palette.danger, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing['2xl'], marginTop: spacing['3xl'] },
  logoutText: { ...typography.labelLg, color: palette.danger },
});
