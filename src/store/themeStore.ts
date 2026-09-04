import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { Platform } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

const memoryStore = new Map<string, string>();

function getSafeStorage(): StateStorage {
  if (Platform.OS === 'web') {
    return {
      getItem: (key: string) => {
        try {
          return typeof window !== 'undefined' && window.localStorage
            ? window.localStorage.getItem(key)
            : null;
        } catch {
          return null;
        }
      },
      setItem: (key: string, value: string) => {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(key, value);
          }
        } catch {}
      },
      removeItem: (key: string) => {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem(key);
          }
        } catch {}
      },
    };
  }

  try {
    // Dynamically require so top-level evaluation doesn't crash if native module is missing
    // (e.g. running in Expo Go or an un-rebuilt native dev client)
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
      return AsyncStorage;
    }
  } catch {
    // AsyncStorage native module is null or unlinked; gracefully fall back to memory
  }

  return {
    getItem: (key: string) => memoryStore.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memoryStore.set(key, value);
    },
    removeItem: (key: string) => {
      memoryStore.delete(key);
    },
  };
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light', // Default is now light mode
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => getSafeStorage()),
    }
  )
);

