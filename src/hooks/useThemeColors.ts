import { useColorScheme } from 'nativewind';

export const COLORS = {
  light: {
    background: '#F8F9FA',
    card: '#FFFFFF',
    border: '#E5E5E5',
    muted: '#737373',
    accent: '#D4AF37',
    textPrimary: '#171717',
    textSecondary: '#525252',
  },
  dark: {
    background: '#0B0B0B',
    card: '#171717',
    border: '#262626',
    muted: '#9E9E9E',
    accent: '#D4AF37',
    textPrimary: '#FFFFFF',
    textSecondary: '#A3A3A3',
  },
};

export function useThemeColors() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  return isDark ? COLORS.dark : COLORS.light;
}
