import { create } from 'zustand';

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
  signInSimulated: (email: string, role: 'actor' | 'director', name: string) => Promise<void>;
  signUpSimulated: (email: string, role: 'actor' | 'director', name: string, additionalDetails?: Partial<UserProfile>) => Promise<void>;
  updateProfileSimulated: (details: Partial<UserProfile>) => void;
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

  signInSimulated: async (email, role, name) => {
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

  signUpSimulated: async (email, role, name, additionalDetails = {}) => {
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

  updateProfileSimulated: (details) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, ...details };
      return { user: updatedUser, role: updatedUser.role };
    });
  },

  signOut: async () => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 300));
    set({ session: null, user: null, role: null, isLoading: false });
  },
}));
