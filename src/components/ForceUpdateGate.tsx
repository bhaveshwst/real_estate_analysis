import React, { useCallback, useEffect, useState } from 'react';
import {
  BackHandler,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Constants from 'expo-constants';
import { fetchRemoteConfigAndCheckForceUpdate } from '@/services/firebase/remote-config';
import { palette, spacing, typography } from '@/theme';

const ANDROID_PACKAGE = 'com.realestate.analytics';

type Props = {
  children: React.ReactNode;
};

export function ForceUpdateGate({ children }: Props) {
  const [forceUpdate, setForceUpdate] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const forced = await fetchRemoteConfigAndCheckForceUpdate();
      if (!cancelled) {
        setForceUpdate(forced);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!forceUpdate) {
      return;
    }
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, [forceUpdate]);

  const openStore = useCallback(() => {
    if (Platform.OS === 'android') {
      void Linking.openURL(`market://details?id=${ANDROID_PACKAGE}`).catch(() =>
        Linking.openURL(
          `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`,
        ),
      );
      return;
    }

    const appStoreId = String(
      Constants.expoConfig?.extra?.iosAppStoreId ?? '',
    ).trim();
    if (appStoreId) {
      void Linking.openURL(`itms-apps://itunes.apple.com/app/id${appStoreId}`);
      return;
    }

    const name = encodeURIComponent(
      Constants.expoConfig?.name ?? 'Real Estate Analytics',
    );
    void Linking.openURL(`https://apps.apple.com/search?term=${name}`);
  }, []);

  return (
    <View style={styles.flex}>
      {children}
      <Modal
        visible={forceUpdate}
        animationType="fade"
        transparent={false}
        onRequestClose={() => {
          /* force update: ignore hardware back */
        }}
      >
        <View style={styles.modalRoot}>
          <Text style={styles.title}>Update required</Text>
          <Text style={styles.body}>
            A new version of the app is required. Please update to continue.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={openStore}
          >
            <Text style={styles.buttonLabel}>Update now</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: palette.white,
  },
  title: {
    ...typography.headingLg,
    color: palette.navy,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  body: {
    ...typography.bodyMd,
    color: palette.gray600,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: palette.teal,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    alignSelf: 'center',
    minWidth: 200,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonLabel: {
    ...typography.bodyLg,
    color: palette.white,
    fontWeight: '600',
    textAlign: 'center',
  },
});
