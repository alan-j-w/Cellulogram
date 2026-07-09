import { createClient } from '@supabase/supabase-js';

// Read env variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Initialize real Supabase client if credentials exist, otherwise null
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// HIGH-FIDELITY LOCAL DATABASE SIMULATOR
// ==========================================

export interface Role {
  id: string;
  director_id: string;
  project_title: string;
  role_title: string;
  category: string;
  age_range: string;
  gender: string;
  language: string;
  location: string;
  description: string;
  requirements: string;
  deadline: string;
  created_at: string;
  director_name?: string;
  director_verified?: boolean;
}

export interface Application {
  id: string;
  role_id: string;
  actor_id: string;
  video_url: string;
  status: 'Submitted' | 'Viewed' | 'Under Review' | 'Shortlisted' | 'Rejected' | 'Meeting Scheduled';
  viewed: boolean;
  shortlisted: boolean;
  created_at: string;
  actor_name?: string;
  actor_age?: string;
  actor_gender?: string;
  actor_location?: string;
  actor_avatar?: string;
  actor_experience?: string;
  actor_skills?: string;
  role_title?: string;
  project_title?: string;
}

// Initial Mock Casting Calls (Focused on Malayalam, Tamil Indie, and Creators)
let mockRoles: Role[] = [
  {
    id: 'role_1',
    director_id: 'dir_1',
    project_title: 'Kathanar: The Wild Hunter',
    role_title: 'Lead Antagonist (Siddha)',
    category: 'Malayalam Feature Film',
    age_range: '25 - 35',
    gender: 'Male',
    language: 'Malayalam',
    location: 'Kochi, Kerala',
    description: 'A grand dark cinematic period drama based on the legendary Malayalam folklore. The character Siddha is a powerful mystical warrior, requiring exceptional physical agility, intense facial acting, and powerful voice projection.',
    requirements: 'Method acting experience, basic swordplay/martial arts training, commanding speaking voice in Malayalam.',
    deadline: '2026-06-15',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    director_name: 'Paramjeet Dhanjal',
    director_verified: true
  },
  {
    id: 'role_2',
    director_id: 'dir_2',
    project_title: 'Nizhal (Shadows)',
    role_title: 'Female Protagonist (Ananya)',
    category: 'Tamil Indie Short Film',
    age_range: '20 - 30',
    gender: 'Female',
    language: 'Tamil',
    location: 'Chennai, Tamil Nadu',
    description: 'A hyper-realistic character-driven noir thriller set in the heavy monsoon nights of Chennai. Ananya is a freelance investigative journalist who stumbles upon a high-profile corporate coverup.',
    requirements: 'Naturalistic acting style, strong voice control, must be fluent in conversational Tamil. Previous short film experience is preferred.',
    deadline: '2026-06-10',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    director_name: 'Gautham Vasudev',
    director_verified: true
  },
  {
    id: 'role_3',
    director_id: 'dir_1',
    project_title: 'The Tech House',
    role_title: 'Quirky Tech Hacker',
    category: 'YouTube Comedy Series',
    age_range: '18 - 26',
    gender: 'Any',
    language: 'Malayalam & English',
    location: 'Kozhikode, Kerala',
    description: 'A fast-paced comedy web series about five graduates sharing a flat and building a bizarre tech startup. Highly dialogue-heavy, utilizing dry humor and self-referential camera breaks.',
    requirements: 'Excellent comedic timing, expressive reactions, fast talking speed. Open to freshers and creators.',
    deadline: '2026-06-30',
    created_at: new Date().toISOString(),
    director_name: 'Paramjeet Dhanjal',
    director_verified: true
  },
  {
    id: 'role_4',
    director_id: 'dir_3',
    project_title: 'Untitled College Romance',
    role_title: 'Freshman Lead',
    category: 'Short Film Project',
    age_range: '18 - 22',
    gender: 'Female',
    language: 'Tamil',
    location: 'Madurai, Tamil Nadu',
    description: 'A charming, high-nostalgia student project filming in Madurai. Captures the simple joys of campus friendships and first love.',
    requirements: 'Fresh, youthful look, energetic and cheerful onscreen presence. Madurai Tamil dialect is an asset.',
    deadline: '2026-06-05',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    director_name: 'Madurai Cine Club',
    director_verified: false
  }
];

// High-Fidelity Mock Applications (with high-quality public video assets for native playback test)
let mockApplications: Application[] = [
  {
    id: 'app_1',
    role_id: 'role_1',
    actor_id: 'actor_1',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    status: 'Submitted',
    viewed: false,
    shortlisted: false,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    actor_name: 'Amal Dev',
    actor_age: '27',
    actor_gender: 'Male',
    actor_location: 'Kochi, Kerala',
    actor_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    actor_experience: '3 years in regional theatre, 2 YouTube shorts.',
    actor_skills: 'Kalaripayattu (Martial Art), Vocal Mimicry, Deep Baritone Voice.',
    role_title: 'Lead Antagonist (Siddha)',
    project_title: 'Kathanar: The Wild Hunter'
  },
  {
    id: 'app_2',
    role_id: 'role_1',
    actor_id: 'actor_2',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    status: 'Viewed',
    viewed: true,
    shortlisted: false,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    actor_name: 'Jithin Thomas',
    actor_age: '31',
    actor_gender: 'Male',
    actor_location: 'Trivandrum, Kerala',
    actor_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    actor_experience: 'Independent film Lead, Dubbing Artist.',
    actor_skills: 'Sword fighting, Angamaly dialect specialist, Horse riding.',
    role_title: 'Lead Antagonist (Siddha)',
    project_title: 'Kathanar: The Wild Hunter'
  },
  {
    id: 'app_3',
    role_id: 'role_2',
    actor_id: 'actor_3',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    status: 'Shortlisted',
    viewed: true,
    shortlisted: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    actor_name: 'Meera Nair',
    actor_age: '24',
    actor_gender: 'Female',
    actor_location: 'Chennai, Tamil Nadu',
    actor_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    actor_experience: 'Lead role in "Nizhalgal" theatre series, Kathak dancer.',
    actor_skills: 'Micro-expressions, Classical dance, Carnatic singing.',
    role_title: 'Female Protagonist (Ananya)',
    project_title: 'Nizhal (Shadows)'
  }
];

export const databaseService = {
  // Upload video to Supabase Storage (or mock stream URL if credentials do not exist)
  async uploadAuditionVideo(uri: string, userId: string): Promise<string> {
    if (supabase) {
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const fileExt = uri.split('.').pop() || 'mp4';
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        const filePath = `auditions/${fileName}`;

        const { error } = await supabase.storage
          .from('cellulogram-assets')
          .upload(filePath, blob, {
            contentType: `video/${fileExt}`,
            cacheControl: '3600',
            upsert: false,
          });

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
          .from('cellulogram-assets')
          .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
      } catch (err) {
        console.error('Supabase storage upload error:', err);
        throw new Error('Failed to upload video to Supabase Storage.');
      }
    }

    // High-fidelity public video fallback URLs (Google APIs gtv-videos-bucket files)
    const mockVideoUrls = [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    ];

    // Pick one randomly
    const index = Math.floor(Math.random() * mockVideoUrls.length);
    return mockVideoUrls[index];
  },

  // Get all roles
  async getRoles(): Promise<Role[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('roles')
        .select(`
          *,
          users (name),
          director_profiles (verified)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching roles:', error);
        throw error;
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        director_id: item.director_id,
        project_title: item.project_title,
        role_title: item.role_title,
        category: item.category,
        age_range: item.age_range,
        gender: item.gender,
        language: item.language,
        location: item.location,
        description: item.description,
        requirements: item.requirements,
        deadline: item.deadline,
        created_at: item.created_at,
        director_name: (Array.isArray(item.users) ? item.users[0]?.name : item.users?.name) || 'Production House',
        director_verified: (Array.isArray(item.director_profiles) ? item.director_profiles[0]?.verified : item.director_profiles?.verified) || false
      }));
    }

    await new Promise((resolve) => setTimeout(resolve, 600)); // Simulate internet delay
    return [...mockRoles];
  },

  // Get single role details
  async getRoleById(id: string): Promise<Role | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from('roles')
        .select(`
          *,
          users (name),
          director_profiles (verified)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching role by ID:', error);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        director_id: data.director_id,
        project_title: data.project_title,
        role_title: data.role_title,
        category: data.category,
        age_range: data.age_range,
        gender: data.gender,
        language: data.language,
        location: data.location,
        description: data.description,
        requirements: data.requirements,
        deadline: data.deadline,
        created_at: data.created_at,
        director_name: (Array.isArray(data.users) ? data.users[0]?.name : data.users?.name) || 'Production House',
        director_verified: (Array.isArray(data.director_profiles) ? data.director_profiles[0]?.verified : data.director_profiles?.verified) || false
      };
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
    const role = mockRoles.find((r) => r.id === id);
    return role ? { ...role } : null;
  },

  // Post a new role (Director workflow)
  async postRole(roleData: Omit<Role, 'id' | 'created_at'>): Promise<Role> {
    if (supabase) {
      const { data, error } = await supabase
        .from('roles')
        .insert({
          director_id: roleData.director_id,
          project_title: roleData.project_title,
          role_title: roleData.role_title,
          category: roleData.category,
          age_range: roleData.age_range,
          gender: roleData.gender,
          language: roleData.language,
          location: roleData.location,
          description: roleData.description,
          requirements: roleData.requirements,
          deadline: roleData.deadline
        })
        .select()
        .single();

      if (error) {
        console.error('Error posting role:', error);
        throw error;
      }

      return data as Role;
    }

    await new Promise((resolve) => setTimeout(resolve, 800));
    const newRole: Role = {
      ...roleData,
      id: `role_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString()
    };
    mockRoles = [newRole, ...mockRoles];
    return newRole;
  },

  // Get applications for a specific role (Director workflow)
  async getApplicationsForRole(roleId: string): Promise<Application[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          users (name, avatar_url),
          actor_profiles (age, gender, location, experience, skills)
        `)
        .eq('role_id', roleId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications for role:', error);
        throw error;
      }

      return (data || []).map((item: any) => {
        const actorUser = item.users;
        const actorProfile = Array.isArray(item.actor_profiles) ? item.actor_profiles[0] : item.actor_profiles;

        return {
          id: item.id,
          role_id: item.role_id,
          actor_id: item.actor_id,
          video_url: item.video_url,
          status: item.status,
          viewed: item.viewed,
          shortlisted: item.shortlisted,
          created_at: item.created_at,
          actor_name: (Array.isArray(actorUser) ? actorUser[0]?.name : actorUser?.name) || 'Talent',
          actor_avatar: Array.isArray(actorUser) ? actorUser[0]?.avatar_url : actorUser?.avatar_url,
          actor_age: (actorProfile?.age)?.toString() || '24',
          actor_gender: actorProfile?.gender || 'Male',
          actor_location: actorProfile?.location || 'Kochi, Kerala',
          actor_experience: actorProfile?.experience || '',
          actor_skills: actorProfile?.skills || ''
        };
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 700));
    return mockApplications.filter((app) => app.role_id === roleId);
  },

  // Get applications submitted by a specific actor (Actor tracking workflow)
  async getApplicationsByActor(actorId: string): Promise<Application[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          users (name, avatar_url),
          actor_profiles (age, gender, location, experience, skills),
          roles (role_title, project_title)
        `)
        .eq('actor_id', actorId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications by actor:', error);
        throw error;
      }

      return (data || []).map((item: any) => {
        const actorUser = item.users;
        const actorProfile = Array.isArray(item.actor_profiles) ? item.actor_profiles[0] : item.actor_profiles;
        const roleInfo = Array.isArray(item.roles) ? item.roles[0] : item.roles;

        return {
          id: item.id,
          role_id: item.role_id,
          actor_id: item.actor_id,
          video_url: item.video_url,
          status: item.status,
          viewed: item.viewed,
          shortlisted: item.shortlisted,
          created_at: item.created_at,
          actor_name: (Array.isArray(actorUser) ? actorUser[0]?.name : actorUser?.name) || 'Talent',
          actor_avatar: Array.isArray(actorUser) ? actorUser[0]?.avatar_url : actorUser?.avatar_url,
          actor_age: (actorProfile?.age)?.toString() || '24',
          actor_gender: actorProfile?.gender || 'Male',
          actor_location: actorProfile?.location || 'Kochi, Kerala',
          actor_experience: actorProfile?.experience || '',
          actor_skills: actorProfile?.skills || '',
          role_title: roleInfo?.role_title || 'Casting Role',
          project_title: roleInfo?.project_title || 'Film Project'
        };
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 600));
    return mockApplications.filter((app) => app.actor_id === actorId);
  },

  // Apply to a role (Actor workflow)
  async applyToRole(applicationData: {
    role_id: string;
    actor_id: string;
    video_url: string;
    actor_name: string;
    actor_age: string;
    actor_gender: string;
    actor_location: string;
    actor_experience?: string;
    actor_skills?: string;
  }): Promise<Application> {
    if (supabase) {
      const { data, error } = await supabase
        .from('applications')
        .insert({
          role_id: applicationData.role_id,
          actor_id: applicationData.actor_id,
          video_url: applicationData.video_url,
          status: 'Submitted',
          viewed: false,
          shortlisted: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error applying to role:', error);
        throw error;
      }

      const role = await this.getRoleById(applicationData.role_id);

      return {
        id: data.id,
        role_id: data.role_id,
        actor_id: data.actor_id,
        video_url: data.video_url,
        status: data.status,
        viewed: data.viewed,
        shortlisted: data.shortlisted,
        created_at: data.created_at,
        actor_name: applicationData.actor_name,
        actor_avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(applicationData.actor_name)}&backgroundColor=d4af37`,
        actor_age: applicationData.actor_age,
        actor_gender: applicationData.actor_gender,
        actor_location: applicationData.actor_location,
        actor_experience: applicationData.actor_experience,
        actor_skills: applicationData.actor_skills,
        role_title: role?.role_title || 'Casting Role',
        project_title: role?.project_title || 'Film Project'
      };
    }

    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulating video processing
    const role = mockRoles.find((r) => r.id === applicationData.role_id);

    const newApp: Application = {
      ...applicationData,
      id: `app_${Math.random().toString(36).substr(2, 9)}`,
      status: 'Submitted',
      viewed: false,
      shortlisted: false,
      created_at: new Date().toISOString(),
      actor_avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(applicationData.actor_name)}&backgroundColor=d4af37`,
      role_title: role?.role_title || 'Casting Role',
      project_title: role?.project_title || 'Film Project'
    };

    mockApplications = [newApp, ...mockApplications];
    return newApp;
  },

  // Update application status: Viewed, Shortlisted, Rejected, etc. (Director workflow)
  async updateApplicationStatus(
    appId: string,
    status: Application['status']
  ): Promise<Application | null> {
    if (supabase) {
      const isShortlisted = status === 'Shortlisted' || status === 'Meeting Scheduled';
      const isViewed = status !== 'Submitted';

      const { error } = await supabase
        .from('applications')
        .update({
          status,
          viewed: isViewed,
          shortlisted: isShortlisted
        })
        .eq('id', appId);

      if (error) {
        console.error('Error updating application status:', error);
        throw error;
      }

      const { data: appDetails, error: detailsError } = await supabase
        .from('applications')
        .select(`
          *,
          users (name, avatar_url),
          actor_profiles (age, gender, location, experience, skills),
          roles (role_title, project_title)
        `)
        .eq('id', appId)
        .single();

      if (detailsError || !appDetails) return null;

      const actorUser = appDetails.users;
      const actorProfile = Array.isArray(appDetails.actor_profiles) ? appDetails.actor_profiles[0] : appDetails.actor_profiles;
      const roleInfo = Array.isArray(appDetails.roles) ? appDetails.roles[0] : appDetails.roles;

      return {
        id: appDetails.id,
        role_id: appDetails.role_id,
        actor_id: appDetails.actor_id,
        video_url: appDetails.video_url,
        status: appDetails.status,
        viewed: appDetails.viewed,
        shortlisted: appDetails.shortlisted,
        created_at: appDetails.created_at,
        actor_name: (Array.isArray(actorUser) ? actorUser[0]?.name : actorUser?.name) || 'Talent',
        actor_avatar: Array.isArray(actorUser) ? actorUser[0]?.avatar_url : actorUser?.avatar_url,
        actor_age: (actorProfile?.age)?.toString() || '24',
        actor_gender: actorProfile?.gender || 'Male',
        actor_location: actorProfile?.location || 'Kochi, Kerala',
        actor_experience: actorProfile?.experience || '',
        actor_skills: actorProfile?.skills || '',
        role_title: roleInfo?.role_title || 'Casting Role',
        project_title: roleInfo?.project_title || 'Film Project'
      };
    }

    await new Promise((resolve) => setTimeout(resolve, 400));
    const index = mockApplications.findIndex((app) => app.id === appId);
    if (index === -1) return null;

    const updatedApp = {
      ...mockApplications[index],
      status,
      viewed: status !== 'Submitted' ? true : mockApplications[index].viewed,
      shortlisted: status === 'Shortlisted' || status === 'Meeting Scheduled',
    };

    mockApplications[index] = updatedApp;
    return updatedApp;
  }
};
