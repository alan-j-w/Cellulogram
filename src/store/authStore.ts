import { create } from 'zustand';
import { supabase } from '@/services/supabase';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'actor' | 'director' | null;
  avatar_url?: string;
  created_at?: string;
  // Actor profile info
  age?: string;
  gender?: string;
  location?: string;
  languages?: string;
  skills?: string;
  experience?: string;
  intro_video_url?: string;
  trust_score?: number;
  // Director profile info
  company_name?: string;
  verified?: boolean;
}

interface AuthState {
  session: any | null;
  user: UserProfile | null;
  role: 'actor' | 'director' | null;
  isLoading: boolean;
  setSession: (session: any) => void;
  setUser: (user: UserProfile | null) => void;
  setRole: (role: 'actor' | 'director' | null) => void;
  signInSimulated: (email: string, role: 'actor' | 'director', name: string, password?: string) => Promise<void>;
  signUpSimulated: (email: string, role: 'actor' | 'director', name: string, additionalDetails?: Partial<UserProfile>, password?: string) => Promise<void>;
  updateProfileSimulated: (details: Partial<UserProfile>) => Promise<void> | void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  role: null,
  isLoading: false,

  setSession: (session) => set({ session }),
  setUser: (user) => set({ user, role: user ? user.role : null }),
  setRole: (role) => set({ role }),

  signInSimulated: async (email, role, name, password) => {
    if (supabase) {
      set({ isLoading: true });
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password: password || 'default_password'
        });
        if (authError) throw authError;

        const userId = authData.user?.id;

        // Fetch profile
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;

        // Fetch role specific details
        let additionalDetails = {};
        if (profile.role === 'actor') {
          const { data: actorProfile } = await supabase
            .from('actor_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();
          additionalDetails = actorProfile || {};
        } else if (profile.role === 'director') {
          const { data: directorProfile } = await supabase
            .from('director_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();
          additionalDetails = directorProfile || {};
        }

        const loggedInUser: UserProfile = {
          id: userId,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          avatar_url: profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name)}&backgroundColor=d4af37`,
          created_at: profile.created_at,
          ...additionalDetails
        };

        set({
          session: authData.session,
          user: loggedInUser,
          role: profile.role,
          isLoading: false
        });
        return;
      } catch (err) {
        set({ isLoading: false });
        console.error('Supabase Sign In error:', err);
        throw err;
      }
    }

    set({ isLoading: true });
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const simulatedUser: UserProfile = {
      id: `usr_${Math.random().toString(36).substr(2, 9)}`,
      email,
      name,
      role,
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=d4af37`,
      created_at: new Date().toISOString(),
      trust_score: 85,
      verified: role === 'director',
      company_name: role === 'director' ? 'A24 Production House' : undefined,
      location: 'Kochi, Kerala',
      age: '24',
      gender: 'Male',
      skills: 'Method Acting, Martial Arts, Voice Over',
      languages: 'Malayalam, Tamil, English',
      experience: '2 Short films, 1 Web series',
    };

    set({
      session: { access_token: 'mock_token', user: { id: simulatedUser.id } },
      user: simulatedUser,
      role,
      isLoading: false,
    });
  },

  signUpSimulated: async (email, role, name, additionalDetails = {}, password) => {
    if (supabase) {
      set({ isLoading: true });
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password: password || 'default_password'
        });
        if (authError) throw authError;

        const userId = authData.user?.id;
        if (!userId) throw new Error('User creation failed.');

        const avatar_url = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=d4af37`;

        // Insert into public.users
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email,
            name,
            role,
            avatar_url
          });

        if (profileError) throw profileError;

        // Insert role-specific profile
        if (role === 'actor') {
          const { error: actorError } = await supabase
            .from('actor_profiles')
            .insert({
              user_id: userId,
              age: parseInt(additionalDetails.age || '25'),
              gender: additionalDetails.gender || 'Male',
              location: additionalDetails.location || 'Kochi, Kerala',
              languages: additionalDetails.languages || 'Malayalam, Tamil',
              skills: additionalDetails.skills || '',
              experience: additionalDetails.experience || ''
            });
          if (actorError) throw actorError;
        } else if (role === 'director') {
          const { error: directorError } = await supabase
            .from('director_profiles')
            .insert({
              user_id: userId,
              company_name: additionalDetails.company_name || 'Independent Production',
              verified: false
            });
          if (directorError) throw directorError;
        }

        const newUser: UserProfile = {
          id: userId,
          email,
          name,
          role,
          avatar_url,
          ...additionalDetails
        };

        set({
          session: authData.session,
          user: newUser,
          role,
          isLoading: false
        });
        return;
      } catch (err) {
        set({ isLoading: false });
        console.error('Supabase Sign Up error:', err);
        throw err;
      }
    }

    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 800));

    const simulatedUser: UserProfile = {
      id: `usr_${Math.random().toString(36).substr(2, 9)}`,
      email,
      name,
      role,
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=d4af37`,
      created_at: new Date().toISOString(),
      trust_score: 90,
      verified: role === 'director',
      location: additionalDetails.location || 'Kochi, Kerala',
      age: additionalDetails.age || '25',
      gender: additionalDetails.gender || 'Male',
      skills: additionalDetails.skills || 'Cinematic Acting, Improvisation',
      languages: additionalDetails.languages || 'Malayalam, Tamil',
      company_name: role === 'director' ? (additionalDetails.company_name || 'Kerala Indie Films') : undefined,
      ...additionalDetails,
    };

    set({
      session: { access_token: 'mock_token', user: { id: simulatedUser.id } },
      user: simulatedUser,
      role,
      isLoading: false,
    });
  },

  updateProfileSimulated: async (details) => {
    if (supabase) {
      set({ isLoading: true });
      try {
        const state = useAuthStore.getState();
        const userId = state.user?.id;
        if (!userId) return;

        // Update public.users
        if (details.name || details.avatar_url) {
          const updateObj: any = {};
          if (details.name) updateObj.name = details.name;
          if (details.avatar_url) updateObj.avatar_url = details.avatar_url;

          const { error: userErr } = await supabase
            .from('users')
            .update(updateObj)
            .eq('id', userId);
          if (userErr) throw userErr;
        }

        // Update actor profile
        if (state.role === 'actor') {
          const updateObj: any = {};
          if (details.age) updateObj.age = parseInt(details.age);
          if (details.gender) updateObj.gender = details.gender;
          if (details.location) updateObj.location = details.location;
          if (details.languages) updateObj.languages = details.languages;
          if (details.skills) updateObj.skills = details.skills;
          if (details.experience) updateObj.experience = details.experience;

          if (Object.keys(updateObj).length > 0) {
            const { error: actorErr } = await supabase
              .from('actor_profiles')
              .update(updateObj)
              .eq('user_id', userId);
            if (actorErr) throw actorErr;
          }
        } 
        // Update director profile
        else if (state.role === 'director') {
          const updateObj: any = {};
          if (details.company_name) updateObj.company_name = details.company_name;

          if (Object.keys(updateObj).length > 0) {
            const { error: dirErr } = await supabase
              .from('director_profiles')
              .update(updateObj)
              .eq('user_id', userId);
            if (dirErr) throw dirErr;
          }
        }

        set((state) => {
          if (!state.user) return state;
          const updatedUser = { ...state.user, ...details };
          return { user: updatedUser, role: updatedUser.role, isLoading: false };
        });
      } catch (err) {
        set({ isLoading: false });
        console.error('Supabase update profile error:', err);
      }
      return;
    }

    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, ...details };
      return { user: updatedUser, role: updatedUser.role };
    });
  },

  signOut: async () => {
    set({ isLoading: true });
    if (supabase) {
      await supabase.auth.signOut();
    } else {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    set({ session: null, user: null, role: null, isLoading: false });
  },
}));
