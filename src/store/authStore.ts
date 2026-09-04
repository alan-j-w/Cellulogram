/**
 * src/store/authStore.ts
 *
 * Production Zustand auth store for Cellulogram.
 *
 * Handles:
 *  - Email/Password sign-in and sign-up
 *  - Google OAuth (platform-aware: native vs. web)
 *  - Session initialization and persistence on app startup
 *  - Supabase auth state change listener
 *  - Role-based profile fetching (actor / director)
 *  - Profile updates
 *  - Sign-out (clears Supabase + native Google SDK)
 *  - Web OAuth callback handling (for the redirect flow)
 */

import { create } from 'zustand';
import { Platform } from 'react-native';
import { supabase } from '@/services/supabase';
import { Session } from '@supabase/supabase-js';
import { initGoogleSignIn, signOutGoogle, extractTokensFromUrl } from '@/lib/auth';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'actor' | 'director' | null;
  avatar_url?: string;
  created_at?: string;
  // Actor profile fields
  age?: string;
  gender?: string;
  location?: string;
  languages?: string;
  skills?: string;
  experience?: string;
  intro_video_url?: string;
  trust_score?: number;
  // Director profile fields
  company_name?: string;
  verified?: boolean;
}

interface AuthState {
  session: Session | null;
  user: UserProfile | null;
  role: 'actor' | 'director' | null;
  isLoading: boolean;

  // Setters
  setSession: (session: Session | null) => void;
  setUser: (user: UserProfile | null) => void;
  setRole: (role: 'actor' | 'director' | null) => void;

  // Auth Actions
  initializeSession: () => Promise<void>;
  handleAuthCallback: (url: string) => Promise<void>;
  signIn: (email: string, role: 'actor' | 'director', password: string) => Promise<void>;
  signInWithGoogle: (role: 'actor' | 'director') => Promise<void>;
  signUp: (
    email: string,
    role: 'actor' | 'director',
    name: string,
    additionalDetails?: Partial<UserProfile>,
    password?: string
  ) => Promise<void>;
  updateProfile: (details: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Fetches the public user profile + role-specific profile from Supabase,
 * merges them into a single UserProfile object.
 */
async function fetchFullProfile(userId: string): Promise<UserProfile | null> {
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    console.error('[authStore] fetchFullProfile error:', profileError);
    return null;
  }

  let additionalDetails: Record<string, any> = {};

  if (profile.role === 'actor') {
    const { data: actorProfile } = await supabase
      .from('actor_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    additionalDetails = actorProfile ?? {};
  } else if (profile.role === 'director') {
    const { data: directorProfile } = await supabase
      .from('director_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    additionalDetails = directorProfile ?? {};
  }

  return {
    id: userId,
    email: profile.email,
    name: profile.name,
    role: profile.role,
    avatar_url:
      profile.avatar_url ??
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name)}&backgroundColor=d4af37`,
    created_at: profile.created_at,
    ...additionalDetails,
  };
}

/**
 * Creates a user record in public.users and inserts a role-specific profile.
 * Called for both first-time Google OAuth users and email/password sign-ups.
 */
async function createPublicProfile(
  userId: string,
  email: string,
  name: string,
  role: 'actor' | 'director',
  avatar_url: string,
  additionalDetails: Partial<UserProfile> = {}
): Promise<void> {
  const { error: insertError } = await supabase.from('users').insert({
    id: userId,
    email,
    name,
    role,
    avatar_url,
  });

  if (insertError) {
    // If duplicate (e.g., race condition on sign-up), ignore the error
    if (insertError.code !== '23505') throw insertError;
  }

  if (role === 'actor') {
    await supabase.from('actor_profiles').upsert({
      user_id: userId,
      age: additionalDetails.age ? parseInt(additionalDetails.age) : null,
      gender: additionalDetails.gender ?? '',
      location: additionalDetails.location ?? '',
      languages: additionalDetails.languages ?? '',
      skills: additionalDetails.skills ?? '',
      experience: additionalDetails.experience ?? '',
    });
  } else if (role === 'director') {
    await supabase.from('director_profiles').upsert({
      user_id: userId,
      company_name: additionalDetails.company_name ?? 'Independent Production',
      verified: false,
    });
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  role: null,
  isLoading: false,

  setSession: (session) => set({ session }),
  setUser: (user) => set({ user, role: user?.role ?? null }),
  setRole: (role) => set({ role }),

  // ── initializeSession ──────────────────────────────────────────────────────
  // Called once in RootLayout on app start. Restores existing session from
  // Supabase's local storage (AsyncStorage on native, localStorage on web).
  initializeSession: async () => {
    set({ isLoading: true });
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;

      if (session) {
        set({ session });
        const profile = await fetchFullProfile(session.user.id);
        if (profile) {
          set({ user: profile, role: profile.role });
        }
      }
    } catch (err) {
      console.error('[authStore] initializeSession error:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  // ── handleAuthCallback ─────────────────────────────────────────────────────
  // Called on Web or via deep-linking when Supabase redirects back with tokens.
  // expo-linking fires a URL event that _layout.tsx listens to, then calls this.
  handleAuthCallback: async (url: string) => {
    set({ isLoading: true });
    try {
      const { accessToken, refreshToken } = extractTokensFromUrl(url);

      if (!accessToken || !refreshToken) {
        console.warn('[authStore] handleAuthCallback: missing tokens in URL');
        return;
      }

      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) throw error;
      if (!data.session) return;

      set({ session: data.session });
      let profile = await fetchFullProfile(data.session.user.id);

      // First-time user via OAuth redirect
      if (!profile) {
        let preferredRole: 'actor' | 'director' = 'actor';
        if (typeof window !== 'undefined' && window.localStorage) {
          const stored = window.localStorage.getItem('cellulogram_pending_role') as 'actor' | 'director';
          if (stored === 'actor' || stored === 'director') preferredRole = stored;
        }

        const user = data.session.user;
        const name = user.user_metadata?.full_name || user.user_metadata?.name || 'New Member';
        const avatar_url =
          user.user_metadata?.avatar_url ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=d4af37`;

        await createPublicProfile(user.id, user.email ?? '', name, preferredRole, avatar_url);
        profile = await fetchFullProfile(user.id);
      }

      if (profile) {
        set({ user: profile, role: profile.role });
      }
    } catch (err) {
      console.error('[authStore] handleAuthCallback error:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  // ── signIn (Email/Password) ────────────────────────────────────────────────
  signIn: async (email, role, password) => {
    set({ isLoading: true });
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error('Sign-in did not return a user ID.');

      const profile = await fetchFullProfile(userId);
      if (!profile) throw new Error('User profile not found. Please sign up first.');

      if (profile.role !== role) {
        await supabase.auth.signOut();
        throw new Error(
          `This account is registered as a ${profile.role}. Please use the correct portal.`
        );
      }

      set({ session: authData.session, user: profile, role: profile.role });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // ── signInWithGoogle ───────────────────────────────────────────────────────
  // Dual-mode: Native Play Services SDK (if compiled & configured) or
  // in-app browser OAuth sheet (Expo Go / Dev Client / Production fallback).
  signInWithGoogle: async (role) => {
    set({ isLoading: true });
    try {
      const googleResult = await initGoogleSignIn(role);

      if (googleResult.mode === 'redirect') {
        // Web redirect triggered — browser will navigate away
        return;
      }

      let authData: any = null;

      if (googleResult.mode === 'native' && googleResult.idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: googleResult.idToken,
        });
        if (error) throw error;
        authData = data;
      } else if (googleResult.mode === 'browser' && googleResult.accessToken && googleResult.refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: googleResult.accessToken,
          refresh_token: googleResult.refreshToken,
        });
        if (error) throw error;
        authData = data;
      } else {
        throw new Error('Google Sign-In failed: credentials missing.');
      }

      const session = authData?.session;
      const userObj = authData?.user ?? session?.user;
      const userId = userObj?.id;
      if (!userId) throw new Error('Sign-in did not return user credentials.');

      const email = userObj?.email ?? '';
      const name =
        googleResult.name ??
        userObj?.user_metadata?.full_name ??
        userObj?.user_metadata?.name ??
        'Google User';
      const avatar_url =
        googleResult.photoUrl ??
        userObj?.user_metadata?.avatar_url ??
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=d4af37`;

      // Check if this user already has a public profile
      const { data: existingProfile } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (existingProfile) {
        // Returning user: verify they're using the right portal
        if (existingProfile.role !== role) {
          await supabase.auth.signOut();
          throw new Error(
            `This Google account is registered as a ${existingProfile.role}. Please select the correct role.`
          );
        }
      } else {
        // First-time Google user: create their public profile
        await createPublicProfile(userId, email, name, role, avatar_url);
      }

      const profile = await fetchFullProfile(userId);
      if (!profile) throw new Error('Failed to load user profile after Google sign-in.');

      set({ session, user: profile, role: profile.role });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    } finally {
      if (Platform.OS !== 'web') {
        set({ isLoading: false });
      }
    }
  },

  // ── signUp (Email/Password) ────────────────────────────────────────────────
  signUp: async (email, role, name, additionalDetails = {}, password) => {
    set({ isLoading: true });
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: password ?? '',
        options: {
          data: { name, role },
        },
      });
      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error('Sign-up did not return a user ID.');

      const avatar_url = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=d4af37`;

      await createPublicProfile(userId, email, name, role, avatar_url, additionalDetails);

      const profile = await fetchFullProfile(userId);
      if (!profile) throw new Error('Failed to load user profile after sign-up.');

      set({ session: authData.session, user: profile, role: profile.role });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // ── updateProfile ──────────────────────────────────────────────────────────
  updateProfile: async (details) => {
    set({ isLoading: true });
    try {
      const state = get();
      const userId = state.user?.id;
      if (!userId) throw new Error('No authenticated user.');

      // Update public.users table
      const userUpdate: Record<string, any> = {};
      if (details.name) userUpdate.name = details.name;
      if (details.avatar_url) userUpdate.avatar_url = details.avatar_url;

      if (Object.keys(userUpdate).length > 0) {
        const { error } = await supabase
          .from('users')
          .update(userUpdate)
          .eq('id', userId);
        if (error) throw error;
      }

      // Update role-specific profile table
      if (state.role === 'actor') {
        const actorUpdate: Record<string, any> = {};
        if (details.age !== undefined) actorUpdate.age = parseInt(details.age);
        if (details.gender !== undefined) actorUpdate.gender = details.gender;
        if (details.location !== undefined) actorUpdate.location = details.location;
        if (details.languages !== undefined) actorUpdate.languages = details.languages;
        if (details.skills !== undefined) actorUpdate.skills = details.skills;
        if (details.experience !== undefined) actorUpdate.experience = details.experience;

        if (Object.keys(actorUpdate).length > 0) {
          const { error } = await supabase
            .from('actor_profiles')
            .update(actorUpdate)
            .eq('user_id', userId);
          if (error) throw error;
        }
      } else if (state.role === 'director') {
        const directorUpdate: Record<string, any> = {};
        if (details.company_name !== undefined)
          directorUpdate.company_name = details.company_name;

        if (Object.keys(directorUpdate).length > 0) {
          const { error } = await supabase
            .from('director_profiles')
            .update(directorUpdate)
            .eq('user_id', userId);
          if (error) throw error;
        }
      }

      // Merge updates into local state immediately (optimistic)
      set((state) => ({
        user: state.user ? { ...state.user, ...details } : null,
        isLoading: false,
      }));
    } catch (err) {
      set({ isLoading: false });
      console.error('[authStore] updateProfile error:', err);
      throw err;
    }
  },

  // ── signOut ────────────────────────────────────────────────────────────────
  signOut: async () => {
    set({ isLoading: true });
    try {
      await supabase.auth.signOut();
      await signOutGoogle(); // No-op on web
    } catch (err) {
      console.error('[authStore] signOut error:', err);
    } finally {
      set({ session: null, user: null, role: null, isLoading: false });
    }
  },
}));

// ─── Auth State Change Listener ───────────────────────────────────────────────
// Syncs Supabase session changes (token refresh, external sign-out, etc.)
// into Zustand automatically, without polling.
supabase.auth.onAuthStateChange((event, session) => {
  const store = useAuthStore.getState();
  store.setSession(session);

  if (event === 'SIGNED_OUT') {
    store.setUser(null);
  }

  // TOKEN_REFRESHED: update session silently without re-fetching profile
  // SIGNED_IN is handled explicitly in each signIn* action above
});
