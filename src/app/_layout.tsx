import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useColorScheme, View } from 'react-native';
import "../global.css";

// Initialize TanStack React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <View className="flex-1 bg-background">
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0B0B0B' },
            animation: 'slide_from_right',
          }}
        >
          {/* Main Landing Screen */}
          <Stack.Screen name="index" />
          
          {/* Auth Folder Group */}
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          
          {/* Actor Portal Group */}
          <Stack.Screen name="(actor)" options={{ headerShown: false }} />
          
          {/* Director Portal Group */}
          <Stack.Screen name="(director)" options={{ headerShown: false }} />
        </Stack>
      </View>
    </QueryClientProvider>
  );
}
