import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are loaded
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase URL or Anon Key is missing. Ensure you have a .env file with EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY set.'
  );
}

// Initialize Supabase client
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// ==========================================
// TYPE DEFINITIONS
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

// ==========================================
// DATABASE SERVICE LAYER
// ==========================================

export const databaseService = {
  /**
   * Uploads an asset (like an audition video) to Supabase Storage.
   */
  async uploadAsset(uri: string, userId: string, folder: string = 'auditions'): Promise<string> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileExt = uri.split('.').pop() || 'mp4';
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error } = await supabase.storage
        .from('cellulogram-assets')
        .upload(filePath, blob, {
          contentType: `video/${fileExt}`, // Adjust if supporting images/resumes
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Supabase storage upload error:', error);
        throw error;
      }

      const { data: publicUrlData } = supabase.storage
        .from('cellulogram-assets')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.error('Failed to upload asset:', err);
      throw new Error('Failed to upload asset to Supabase Storage.');
    }
  },

  /**
   * Helper alias for uploading audition videos.
   */
  async uploadAuditionVideo(uri: string, userId: string): Promise<string> {
    return this.uploadAsset(uri, userId, 'auditions');
  },

  /**
   * Fetches all available roles for the public casting board, optionally filtered by director.
   */
  async getRoles(directorId?: string): Promise<Role[]> {
    let query = supabase
      .from('roles')
      .select(`
        *,
        users!director_id (
          name,
          director_profiles (verified)
        )
      `)
      .order('created_at', { ascending: false });

    if (directorId) {
      query = query.eq('director_id', directorId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }

    return (data || []).map((item: any) => {
      const userObj = Array.isArray(item.users) ? item.users[0] : item.users;
      const dirProfile = Array.isArray(userObj?.director_profiles)
        ? userObj?.director_profiles[0]
        : userObj?.director_profiles;

      return {
        ...item,
        director_name: userObj?.name || 'Production House',
        director_verified: Boolean(dirProfile?.verified),
      };
    });
  },

  /**
   * Fetches a specific role by its ID.
   */
  async getRoleById(id: string): Promise<Role | null> {
    const { data, error } = await supabase
      .from('roles')
      .select(`
        *,
        users!director_id (
          name,
          director_profiles (verified)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching role by ID:', error);
      return null;
    }

    if (!data) return null;

    const userObj = Array.isArray(data.users) ? data.users[0] : data.users;
    const dirProfile = Array.isArray(userObj?.director_profiles)
      ? userObj?.director_profiles[0]
      : userObj?.director_profiles;

    return {
      ...data,
      director_name: userObj?.name || 'Production House',
      director_verified: Boolean(dirProfile?.verified),
    };
  },

  /**
   * Posts a new role (Director workflow).
   */
  async postRole(roleData: Omit<Role, 'id' | 'created_at'>): Promise<Role> {
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
  },

  /**
   * Fetches all applications for a specific role (Director workflow).
   */
  async getApplicationsForRole(roleId: string): Promise<Application[]> {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        users!actor_id (
          name,
          avatar_url,
          actor_profiles (age, gender, location, experience, skills)
        )
      `)
      .eq('role_id', roleId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching applications for role:', error);
      throw error;
    }

    return (data || []).map((item: any) => {
      const actorUser = Array.isArray(item.users) ? item.users[0] : item.users;
      const actorProfile = Array.isArray(actorUser?.actor_profiles)
        ? actorUser?.actor_profiles[0]
        : actorUser?.actor_profiles;

      return {
        ...item,
        actor_name: actorUser?.name || 'Talent',
        actor_avatar: actorUser?.avatar_url,
        actor_age: (actorProfile?.age)?.toString() || '',
        actor_gender: actorProfile?.gender || '',
        actor_location: actorProfile?.location || '',
        actor_experience: actorProfile?.experience || '',
        actor_skills: actorProfile?.skills || ''
      };
    });
  },

  /**
   * Fetches all applications submitted by a specific actor (Actor workflow).
   */
  async getApplicationsByActor(actorId: string): Promise<Application[]> {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        users!actor_id (
          name,
          avatar_url,
          actor_profiles (age, gender, location, experience, skills)
        ),
        roles (role_title, project_title)
      `)
      .eq('actor_id', actorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching applications by actor:', error);
      throw error;
    }

    return (data || []).map((item: any) => {
      const actorUser = Array.isArray(item.users) ? item.users[0] : item.users;
      const actorProfile = Array.isArray(actorUser?.actor_profiles)
        ? actorUser?.actor_profiles[0]
        : actorUser?.actor_profiles;
      const roleInfo = Array.isArray(item.roles) ? item.roles[0] : item.roles;

      return {
        ...item,
        actor_name: actorUser?.name || 'Talent',
        actor_avatar: actorUser?.avatar_url,
        actor_age: (actorProfile?.age)?.toString() || '',
        actor_gender: actorProfile?.gender || '',
        actor_location: actorProfile?.location || '',
        actor_experience: actorProfile?.experience || '',
        actor_skills: actorProfile?.skills || '',
        role_title: roleInfo?.role_title || 'Casting Role',
        project_title: roleInfo?.project_title || 'Film Project'
      };
    });
  },

  /**
   * Submits a new application to a role (Actor workflow).
   */
  async applyToRole(applicationData: {
    role_id: string;
    actor_id: string;
    video_url: string;
  }): Promise<Application> {
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
      .select(`
        *,
        users!actor_id (
          name,
          avatar_url,
          actor_profiles (age, gender, location, experience, skills)
        ),
        roles (role_title, project_title)
      `)
      .single();

    if (error) {
      console.error('Error applying to role:', error);
      throw error;
    }
    
    const actorUser = Array.isArray(data.users) ? data.users[0] : data.users;
    const actorProfile = Array.isArray(actorUser?.actor_profiles)
      ? actorUser?.actor_profiles[0]
      : actorUser?.actor_profiles;
    const roleInfo = Array.isArray(data.roles) ? data.roles[0] : data.roles;

    return {
      ...data,
      actor_name: actorUser?.name || 'Talent',
      actor_avatar: actorUser?.avatar_url,
      actor_age: (actorProfile?.age)?.toString() || '',
      actor_gender: actorProfile?.gender || '',
      actor_location: actorProfile?.location || '',
      actor_experience: actorProfile?.experience || '',
      actor_skills: actorProfile?.skills || '',
      role_title: roleInfo?.role_title || 'Casting Role',
      project_title: roleInfo?.project_title || 'Film Project'
    };
  },

  /**
   * Updates an application's status (Director workflow).
   */
  async updateApplicationStatus(
    appId: string,
    status: Application['status']
  ): Promise<Application | null> {
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

    // Fetch the updated full record
    const { data: appDetails, error: detailsError } = await supabase
      .from('applications')
      .select(`
        *,
        users!actor_id (
          name,
          avatar_url,
          actor_profiles (age, gender, location, experience, skills)
        ),
        roles (role_title, project_title)
      `)
      .eq('id', appId)
      .single();

    if (detailsError || !appDetails) return null;

    const actorUser = Array.isArray(appDetails.users) ? appDetails.users[0] : appDetails.users;
    const actorProfile = Array.isArray(actorUser?.actor_profiles)
      ? actorUser?.actor_profiles[0]
      : actorUser?.actor_profiles;
    const roleInfo = Array.isArray(appDetails.roles) ? appDetails.roles[0] : appDetails.roles;

    return {
      ...appDetails,
      actor_name: actorUser?.name || 'Talent',
      actor_avatar: actorUser?.avatar_url,
      actor_age: (actorProfile?.age)?.toString() || '',
      actor_gender: actorProfile?.gender || '',
      actor_location: actorProfile?.location || '',
      actor_experience: actorProfile?.experience || '',
      actor_skills: actorProfile?.skills || '',
      role_title: roleInfo?.role_title || 'Casting Role',
      project_title: roleInfo?.project_title || 'Film Project'
    };
  }
};
