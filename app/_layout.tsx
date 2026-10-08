import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import 'react-native-reanimated';
import { isLoggedIn } from '@/lib/auth';
import { Colors } from '@/constants/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const ok = await isLoggedIn();
      setAuthed(ok);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const onLogin = segments[0] === 'login';
    if (!authed && !onLogin) {
      router.replace('/login');
    } else if (authed && onLogin) {
      router.replace('/(tabs)');
    }
  }, [ready, authed, segments]);

  useEffect(() => {
    if (!ready) return;
    isLoggedIn().then(setAuthed);
  }, [segments, ready]);

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: Colors.light.header,
        }}
      >
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="bajaj/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen
          name="ajouter-bajaj"
          options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
        />
        <Stack.Screen name="modifier-bajaj/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="chauffeur/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen
          name="ajouter-chauffeur"
          options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
        />
        <Stack.Screen
          name="modifier-chauffeur/[id]"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="ajouter-versement"
          options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
        />
        <Stack.Screen name="versement/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen
          name="ajouter-frais"
          options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
        />
        <Stack.Screen name="frais/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="notifications" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="historique" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="gps" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="stats" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
