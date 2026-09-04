import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { useColorScheme } from 'nativewind';
import * as Linking from 'expo-linking';
import "../global.css";
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';

// Initialize TanStack React Query Client (module-level singleton)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const rnColorScheme = useRNColorScheme();
  const { colorScheme, setColorScheme } = useColorScheme();
  const theme = useThemeStore(state => state.theme);

  const initializeSession = useAuthStore(state => state.initializeSession);
  const handleAuthCallback = useAuthStore(state => state.handleAuthCallback);

  // Sync NativeWind colorScheme with our themeStore
  useEffect(() => {
    if (theme === 'system') {
      // Handle ColorSchemeName which includes 'unspecified'
      const validScheme = rnColorScheme === 'light' || rnColorScheme === 'dark'
        ? rnColorScheme
        : 'light';
      setColorScheme(validScheme);
    } else {
      setColorScheme(theme as 'light' | 'dark');
    }
  }, [theme, rnColorScheme, setColorScheme]);

  // Restore Supabase session from local storage on app start
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // Listen for OAuth redirect URLs (Web: Supabase returns tokens in URL hash)
  useEffect(() => {
    const handleUrl = (event: { url: string }) => {
      const url = event.url;
      if (url && (url.includes('access_token') || url.includes('auth/callback'))) {
        handleAuthCallback(url);
      }
    };

    const subscription = Linking.addEventListener('url', handleUrl);

    // Handle the case where the app was launched via deep link
    Linking.getInitialURL().then((url) => {
      if (url && (url.includes('access_token') || url.includes('auth/callback'))) {
        handleAuthCallback(url);
      }
    });

    return () => subscription.remove();
  }, [handleAuthCallback]);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colorScheme === 'dark' ? '#0B0B0B' : '#F8F9FA' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(actor)" options={{ headerShown: false }} />
        <Stack.Screen name="(director)" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}

