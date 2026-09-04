import '@/global.css';
import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#F8F9FA',
    card: '#FFFFFF',
    border: '#E5E5E5',
    muted: '#737373',
    accent: '#D4AF37',
    textPrimary: '#171717',
    textSecondary: '#525252',
    text: '#171717',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
  },
  dark: {
    background: '#0B0B0B',
    card: '#171717',
    border: '#262626',
    muted: '#9E9E9E',
    accent: '#D4AF37',
    textPrimary: '#FFFFFF',
    textSecondary: '#A3A3A3',
    text: '#FFFFFF',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
  },
} as const;

export const StatusBadgeColors = {
  submitted: {
    label: 'Submitted',
    light: { text: '#525252', bg: 'rgba(115, 115, 115, 0.08)', border: 'rgba(115, 115, 115, 0.2)' },
    dark: { text: '#A3A3A3', bg: 'rgba(163, 163, 163, 0.12)', border: 'rgba(163, 163, 163, 0.25)' },
  },
  viewed: {
    label: 'Viewed',
    light: { text: '#0284c7', bg: 'rgba(2, 132, 199, 0.08)', border: 'rgba(2, 132, 199, 0.2)' },
    dark: { text: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.25)' },
  },
  underReview: {
    label: 'Under Review',
    light: { text: '#d97706', bg: 'rgba(217, 119, 6, 0.08)', border: 'rgba(217, 119, 6, 0.2)' },
    dark: { text: '#fbbf24', bg: 'rgba(251, 191, 36, 0.12)', border: 'rgba(251, 191, 36, 0.25)' },
  },
  shortlisted: {
    label: 'Shortlisted',
    light: { text: '#b45309', bg: 'rgba(212, 175, 55, 0.12)', border: 'rgba(212, 175, 55, 0.3)' },
    dark: { text: '#D4AF37', bg: 'rgba(212, 175, 55, 0.15)', border: 'rgba(212, 175, 55, 0.35)' },
  },
  meetingScheduled: {
    label: 'Meeting Scheduled',
    light: { text: '#7c3aed', bg: 'rgba(124, 58, 237, 0.08)', border: 'rgba(124, 58, 237, 0.2)' },
    dark: { text: '#a78bfa', bg: 'rgba(167, 139, 250, 0.12)', border: 'rgba(167, 139, 250, 0.25)' },
  },
  rejected: {
    label: 'Passed',
    light: { text: '#dc2626', bg: 'rgba(220, 38, 38, 0.08)', border: 'rgba(220, 38, 38, 0.2)' },
    dark: { text: '#f87171', bg: 'rgba(248, 113, 113, 0.12)', border: 'rgba(248, 113, 113, 0.25)' },
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
