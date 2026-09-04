/**
 * src/lib/auth.ts
 *
 * Production Dual-Mode Google Authentication Utility.
 *
 * Strategy:
 *  - Native Mode: Uses @react-native-google-signin/google-signin when the native
 *    binary module is compiled and valid Client IDs are configured.
 *  - Browser OAuth Fallback: When running in Expo Go, development clients without
 *    the custom native binary, or on Web, it seamlessly uses Supabase Google OAuth
 *    with expo-web-browser.
 *
 * Both paths result in a full Supabase session and user profile.
 */

import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '@/services/supabase';

// Ensure WebBrowser can handle incoming authentication redirects
WebBrowser.maybeCompleteAuthSession();

// ─── Native Import (conditional) ────────────────────────────────────────────
let GoogleSignin: any = null;
if (Platform.OS !== 'web') {
  try {
    GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
  } catch {
    // Expected when running in Expo Go or standard dev client
  }
}

/**
 * Checks whether native Google Sign-In is compiled and has valid non-placeholder credentials.
 */
export function isNativeGoogleSignInAvailable(): boolean {
  if (Platform.OS === 'web') return false;
  if (!GoogleSignin) return false;

  const webId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const androidId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  const iosId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const clientId = Platform.OS === 'android' ? androidId : iosId;

  if (!webId || !clientId) return false;
  if (clientId.startsWith('xxxx') || clientId.includes('YOUR_')) return false;

  return true;
}

// Configure native SDK once if valid
if (isNativeGoogleSignInAvailable()) {
  try {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      offlineAccess: false,
      scopes: ['profile', 'email'],
    });
  } catch (err) {
    console.warn('[auth] GoogleSignin.configure error:', err);
  }
}

// ─── Helper: Token Extraction ────────────────────────────────────────────────
export function extractTokensFromUrl(url: string): { accessToken: string | null; refreshToken: string | null } {
  let accessToken: string | null = null;
  let refreshToken: string | null = null;

  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(
      urlObj.hash.startsWith('#') ? urlObj.hash.slice(1) : urlObj.search
    );
    accessToken = params.get('access_token');
    refreshToken = params.get('refresh_token');
  } catch {
    // Regex fallback for non-standard URI schemes
    const matchAccess = url.match(/[#?&]access_token=([^&]+)/);
    const matchRefresh = url.match(/[#?&]refresh_token=([^&]+)/);
    if (matchAccess) accessToken = decodeURIComponent(matchAccess[1]);
    if (matchRefresh) refreshToken = decodeURIComponent(matchRefresh[1]);
  }

  return { accessToken, refreshToken };
}

// ─── Types ───────────────────────────────────────────────────────────────────
export interface GoogleAuthResult {
  mode: 'native' | 'browser' | 'redirect';
  idToken?: string;
  accessToken?: string;
  refreshToken?: string;
  name?: string | null;
  email?: string;
  photoUrl?: string | null;
}

// ─── Native Google Sign-In ───────────────────────────────────────────────────
export async function signInWithGoogleNative(): Promise<GoogleAuthResult> {
  if (!GoogleSignin) {
    throw new Error('Google Sign-In native module is not available.');
  }

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();

  const idToken = response?.data?.idToken;
  if (!idToken) {
    throw new Error('Google Sign-In did not return an ID token.');
  }

  const user = response?.data?.user;
  return {
    mode: 'native',
    idToken,
    name: user?.name ?? null,
    email: user?.email ?? '',
    photoUrl: user?.photo ?? null,
  };
}

// ─── Web Google OAuth ─────────────────────────────────────────────────────────
export async function signInWithGoogleWeb(role?: 'actor' | 'director'): Promise<GoogleAuthResult> {
  if (typeof window !== 'undefined' && role) {
    try {
      window.localStorage.setItem('cellulogram_pending_role', role);
    } catch {
      // Ignore
    }
  }

  const redirectUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback`
    : 'cellulogram://auth/callback';

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) throw error;
  return { mode: 'redirect' };
}

// ─── Mobile In-App Browser OAuth (Expo Go / Dev Client / Production Fallback) ───
export async function signInWithGoogleBrowserMobile(): Promise<GoogleAuthResult> {
  const redirectUrl = Linking.createURL('auth/callback') || 'cellulogram://auth/callback';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: true,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) throw error;
  if (!data?.url) throw new Error('No authorization URL returned from Supabase.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

  if (result.type === 'cancel' || result.type === 'dismiss') {
    throw new Error('Google sign-in was cancelled.');
  }

  if (result.type === 'success' && result.url) {
    const { accessToken, refreshToken } = extractTokensFromUrl(result.url);

    if (!accessToken || !refreshToken) {
      throw new Error('Google authentication completed, but session tokens were missing.');
    }

    return {
      mode: 'browser',
      accessToken,
      refreshToken,
    };
  }

  throw new Error('Unable to complete Google authentication.');
}

// ─── Platform-Aware Entry Point ───────────────────────────────────────────────
export async function initGoogleSignIn(role?: 'actor' | 'director'): Promise<GoogleAuthResult> {
  if (Platform.OS === 'web') {
    return signInWithGoogleWeb(role);
  }

  if (isNativeGoogleSignInAvailable()) {
    try {
      return await signInWithGoogleNative();
    } catch (err: any) {
      console.warn('[auth] Native Google Sign-In failed, falling back to in-app browser:', err?.message);
      return await signInWithGoogleBrowserMobile();
    }
  }

  // Graceful browser OAuth fallback for Expo Go, dev clients, and non-configured environments
  return await signInWithGoogleBrowserMobile();
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────
export async function signOutGoogle(): Promise<void> {
  if (Platform.OS !== 'web' && GoogleSignin && isNativeGoogleSignInAvailable()) {
    try {
      await GoogleSignin.signOut();
    } catch {
      // Non-fatal
    }
  }
}
