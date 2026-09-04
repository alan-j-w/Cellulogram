-- ==========================================
-- CELLULOGRAM: SUPABASE INITIAL SCHEMA
-- ==========================================

-- 1. Create Tables

-- Users table (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('actor', 'director')) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Actor Profiles
CREATE TABLE public.actor_profiles (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  age INTEGER,
  gender TEXT,
  location TEXT,
  languages TEXT,
  skills TEXT,
  experience TEXT,
  intro_video_url TEXT,
  trust_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Director Profiles
CREATE TABLE public.director_profiles (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  company_name TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Roles (Casting Calls)
CREATE TABLE public.roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  director_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  project_title TEXT NOT NULL,
  role_title TEXT NOT NULL,
  category TEXT NOT NULL,
  age_range TEXT NOT NULL,
  gender TEXT NOT NULL,
  language TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  deadline DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Applications
CREATE TABLE public.applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  video_url TEXT NOT NULL,
  status TEXT CHECK (status IN ('Submitted', 'Viewed', 'Under Review', 'Shortlisted', 'Rejected', 'Meeting Scheduled')) DEFAULT 'Submitted' NOT NULL,
  viewed BOOLEAN DEFAULT FALSE NOT NULL,
  shortlisted BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(role_id, actor_id) -- An actor can only apply once per role
);

-- ==========================================
-- 2. Row Level Security (RLS) Policies
-- ==========================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.director_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Users can read all users (needed for display names/avatars)
CREATE POLICY "Users are viewable by everyone" ON public.users FOR SELECT USING (true);
-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
-- Users can insert their own profile on signup
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);


-- Actor Profiles: Viewable by all, updatable by owner
CREATE POLICY "Actor profiles viewable by everyone" ON public.actor_profiles FOR SELECT USING (true);
CREATE POLICY "Actor profiles updatable by owner" ON public.actor_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Actor profiles insertable by owner" ON public.actor_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Director Profiles: Viewable by all, updatable by owner
CREATE POLICY "Director profiles viewable by everyone" ON public.director_profiles FOR SELECT USING (true);
CREATE POLICY "Director profiles updatable by owner" ON public.director_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Director profiles insertable by owner" ON public.director_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Roles: Anyone can view roles, but only directors can create/update their own roles
CREATE POLICY "Roles are viewable by everyone" ON public.roles FOR SELECT USING (true);
CREATE POLICY "Directors can insert their own roles" ON public.roles FOR INSERT WITH CHECK (auth.uid() = director_id);
CREATE POLICY "Directors can update their own roles" ON public.roles FOR UPDATE USING (auth.uid() = director_id);
CREATE POLICY "Directors can delete their own roles" ON public.roles FOR DELETE USING (auth.uid() = director_id);

-- Applications:
-- 1. Actors can view their own applications
-- 2. Directors can view applications for their roles
-- 3. Actors can insert their own applications
-- 4. Directors can update the status of applications for their roles
CREATE POLICY "Actors view own applications" ON public.applications FOR SELECT USING (auth.uid() = actor_id);
CREATE POLICY "Directors view applications for their roles" ON public.applications FOR SELECT USING (
  auth.uid() IN (SELECT director_id FROM public.roles WHERE id = role_id)
);
CREATE POLICY "Actors can insert own applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = actor_id);
CREATE POLICY "Directors can update applications for their roles" ON public.applications FOR UPDATE USING (
  auth.uid() IN (SELECT director_id FROM public.roles WHERE id = role_id)
);


-- ==========================================
-- 3. Storage Setup (cellulogram-assets)
-- ==========================================
-- Note: Storage buckets must be created via the Dashboard or API before these policies will work.
-- Assuming a bucket named 'cellulogram-assets' exists and is PUBLIC.

INSERT INTO storage.buckets (id, name, public) VALUES ('cellulogram-assets', 'cellulogram-assets', true) ON CONFLICT DO NOTHING;

-- Storage Policies
-- Anyone can read assets
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'cellulogram-assets');
-- Authenticated users can upload assets
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cellulogram-assets' AND auth.role() = 'authenticated');
-- Users can update/delete their own assets
CREATE POLICY "Users can update own assets" ON storage.objects FOR UPDATE USING (bucket_id = 'cellulogram-assets' AND auth.uid() = owner);
CREATE POLICY "Users can delete own assets" ON storage.objects FOR DELETE USING (bucket_id = 'cellulogram-assets' AND auth.uid() = owner);
